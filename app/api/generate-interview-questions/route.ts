import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    console.log('=== Starting Interview Questions Generation ===');
    
    const { jobTitle, experienceLevel, skills } = await request.json();
    console.log('Request parameters:', { jobTitle, experienceLevel, skills });

    if (!jobTitle || !experienceLevel || !skills) {
      console.error('Missing required fields:', { jobTitle, experienceLevel, skills });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `Generate 5 technical interview questions for a ${experienceLevel} ${jobTitle} position.
    The candidate should have experience with: ${skills.join(', ')}.
    
    Rules:
    1. Generate exactly 5 questions
    2. Each question must end with a question mark
    3. Questions should be technical and relevant to the position
    4. Each question should be on a new line
    5. Do not include any numbering, bullet points, or formatting
    6. Do not include any explanations or additional text
    7. Do not include any XML tags, HTML tags, or other markup
    8. Do not include any thinking process or internal dialogue
    
    Example format:
    What is your experience with React hooks?
    How do you handle state management in large applications?
    Can you explain the concept of closures in JavaScript?
    What are your strategies for optimizing application performance?
    How do you approach testing in your development process?`;

    console.log('Sending prompt to AI...');
    const response = await generateText(prompt);
    console.log('Raw AI response:', response);

    // Extract questions from the response
    const questions = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Remove any markdown formatting, numbers, or XML tags
        const cleanLine = line
          .replace(/^[\d\.\s-]+/, '')
          .replace(/<[^>]*>/g, '')
          .replace(/\n/g, '')
          .replace(/\r/g, '')
          .replace(/\t/g, '')
          .trim();
        const isValid = cleanLine.endsWith('?') && cleanLine.length > 10;
        console.log('Line validation:', { original: line, cleaned: cleanLine, isValid });
        return isValid;
      })
      .map(line => line
        .replace(/^[\d\.\s-]+/, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .trim());

    console.log('Extracted questions:', questions);

    // Validate the questions
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('No valid questions were extracted');
      throw new Error('No valid questions were generated');
    }

    // Ensure we have exactly 5 questions
    const defaultQuestions = [
      "What is your approach to problem-solving?",
      "How do you handle technical challenges?",
      "Can you describe your development workflow?",
      "What are your strategies for code optimization?",
      "How do you ensure code quality in your projects?"
    ];

    let finalQuestions;
    if (questions.length < 5) {
      console.warn(`Only ${questions.length} questions were generated, padding with default questions`);
      finalQuestions = [...questions];
      while (finalQuestions.length < 5) {
        finalQuestions.push(defaultQuestions[finalQuestions.length]);
      }
    } else if (questions.length > 5) {
      console.warn(`More than 5 questions were generated, truncating to 5`);
      finalQuestions = questions.slice(0, 5);
    } else {
      finalQuestions = questions;
    }

    // Final validation and cleaning
    finalQuestions = finalQuestions.map(q => {
      // Remove any remaining XML/HTML tags and special characters
      q = q
        .replace(/<[^>]*>/g, '')
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .trim();
      // Ensure it ends with a question mark
      if (!q.endsWith('?')) {
        return q + '?';
      }
      return q;
    });

    console.log('Final questions:', finalQuestions);
    return NextResponse.json({ questions: finalQuestions });
  } catch (error: any) {
    console.error("Error in generate-interview-questions:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Return default questions in case of error
    const defaultQuestions = [
      "What is your approach to problem-solving?",
      "How do you handle technical challenges?",
      "Can you describe your development workflow?",
      "What are your strategies for code optimization?",
      "How do you ensure code quality in your projects?"
    ];
    
    return NextResponse.json({ questions: defaultQuestions });
  }
} 