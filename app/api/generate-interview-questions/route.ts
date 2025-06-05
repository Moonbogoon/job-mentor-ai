import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    console.log('Received request for interview questions generation');
    
    const { jobTitle, experienceLevel, skills } = await request.json();
    console.log('Request body:', { jobTitle, experienceLevel, skills });

    if (!jobTitle || !experienceLevel || !skills) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `Generate 5 technical interview questions for a ${experienceLevel} ${jobTitle} position. 
    The candidate should have experience with: ${skills.join(', ')}.
    For each question, provide:
    1. The question
    2. A detailed answer
    3. Key points to look for in the candidate's response
    4. Follow-up questions
    
    Format the response in a clear, structured way.`;

    console.log('Sending prompt to OpenAI...');
    const questions = await generateText(prompt);
    console.log('Received response from OpenAI:', questions);

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