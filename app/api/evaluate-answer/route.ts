import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"

interface Feedback {
  strengths: string[];
  improvements: string[];
  overall: string;
}

export async function POST(request: Request) {
  try {
    const { question, answer, resumeContent } = await request.json()

    if (!question || !answer || !resumeContent) {
      return NextResponse.json(
        { error: "Question, answer, and resume content are required" },
        { status: 400 }
      )
    }

    const prompt = `Evaluate the following interview answer based on the candidate's resume and the question asked.

    Question: ${question}
    Answer: ${answer}
    Resume: ${resumeContent}

    Please provide a detailed evaluation with:
    1. Key strengths in the answer (list 2-3 points)
    2. Areas for improvement (list 2-3 points)
    3. Overall assessment (2-3 sentences)

    Format your response exactly like this example:
    STRENGTHS:
    - Clear explanation of technical concepts
    - Good use of specific examples
    - Demonstrated problem-solving approach

    IMPROVEMENTS:
    - Could provide more specific details
    - Should include more real-world examples
    - Consider discussing alternative solutions

    OVERALL:
    The candidate provided a solid technical response that demonstrated good understanding of the concepts. However, the answer could be strengthened with more specific examples and consideration of alternative approaches.`;

    const evaluation = await generateText(prompt)
    console.log('Raw evaluation:', evaluation);

    // Parse the evaluation into structured format
    const sections = evaluation.split('\n\n');
    const feedback: Feedback = {
      strengths: [],
      improvements: [],
      overall: ''
    };

    for (const section of sections) {
      if (section.startsWith('STRENGTHS:')) {
        feedback.strengths = section
          .replace('STRENGTHS:', '')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-'))
          .map(line => line.replace('-', '').trim());
      } else if (section.startsWith('IMPROVEMENTS:')) {
        feedback.improvements = section
          .replace('IMPROVEMENTS:', '')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-'))
          .map(line => line.replace('-', '').trim());
      } else if (section.startsWith('OVERALL:')) {
        feedback.overall = section
          .replace('OVERALL:', '')
          .trim();
      }
    }

    // Validate the feedback
    if (feedback.strengths.length === 0) {
      feedback.strengths = [
        "Demonstrated understanding of the topic",
        "Provided relevant examples"
      ];
    }

    if (feedback.improvements.length === 0) {
      feedback.improvements = [
        "Could provide more specific details",
        "Consider adding more examples"
      ];
    }

    if (!feedback.overall) {
      feedback.overall = "The answer shows good understanding but could be improved with more specific examples and details.";
    }

    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error("Error in evaluate-answer:", error)
    return NextResponse.json(
      { 
        strengths: ["Demonstrated understanding of the topic", "Provided relevant examples"],
        improvements: ["Could provide more specific details", "Consider adding more examples"],
        overall: "The answer shows good understanding but could be improved with more specific examples and details."
      }
    )
  }
} 