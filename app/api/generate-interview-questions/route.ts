import { NextResponse } from "next/server"
import { generateText } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    console.log('Received request for interview questions generation');
    
    const body = await request.json();
    console.log('Request body:', body);

    if (!body.resumeContent) {
      throw new Error('Resume content is required');
    }

    const { resumeContent } = body;

    const prompt = `Based on the following resume, generate 5 relevant interview questions that would help assess the candidate's qualifications, experience, and fit for the role. The questions should be specific to their background and experience.

Resume:
${resumeContent}

IMPORTANT: Your response must be a valid JSON array of strings. Each string should be a question.
Example format:
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]

Generate 5 interview questions that:
1. Are specific to the candidate's experience and skills
2. Include both technical and behavioral questions
3. Help assess their problem-solving abilities
4. Evaluate their communication skills
5. Gauge their career goals and motivations`

    console.log('Sending prompt to Gemini...');
    const content = await generateText(prompt);
    console.log('Received response from Gemini:', content);

    let questions: string[];
    try {
      questions = JSON.parse(content);
      console.log('Parsed questions:', questions);

      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      if (questions.length === 0) {
        throw new Error('Empty questions array');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Attempting to extract questions from text...');
      
      // Fallback: Try to extract questions from text
      questions = content
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('"') || 
                 trimmed.startsWith('-') || 
                 trimmed.startsWith('•') ||
                 trimmed.startsWith('1.') ||
                 trimmed.startsWith('2.') ||
                 trimmed.startsWith('3.') ||
                 trimmed.startsWith('4.') ||
                 trimmed.startsWith('5.');
        })
        .map(line => {
          return line
            .replace(/^["-•]\s*/, '')
            .replace(/^[1-5]\.\s*/, '')
            .replace(/["\s]*$/, '')
            .trim();
        })
        .filter(Boolean);
      
      console.log('Extracted questions:', questions);
      
      if (questions.length === 0) {
        throw new Error('Failed to parse questions from response');
      }
    }

    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error("Error in generate-interview-questions:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate questions",
        details: error.stack
      },
      { status: 500 }
    )
  }
} 