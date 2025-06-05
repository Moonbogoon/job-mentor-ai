import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"

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
    1. Key strengths in the answer
    2. Areas for improvement
    3. Overall assessment
    4. Specific suggestions for better responses

    Format the response as a JSON object with the following structure:
    {
      "strengths": ["strength1", "strength2", ...],
      "improvements": ["improvement1", "improvement2", ...],
      "overall": "Overall assessment text"
    }`

    const evaluation = await generateText(prompt)
    const feedback = JSON.parse(evaluation)

    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error("Error in evaluate-answer:", error)
    return NextResponse.json(
      { error: error.message || "Failed to evaluate answer" },
      { status: 500 }
    )
  }
} 