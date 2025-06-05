import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 }
      )
    }

    const prompt = `Analyze the following resume content and provide specific suggestions for improvement in these areas:
    1. Content and Structure
    2. Skills and Experience
    3. Achievements and Impact
    4. Language and Tone
    5. Overall Professional Presentation

    Resume content:
    ${content}

    Please provide detailed, actionable suggestions for each area.`

    const suggestions = await generateText(prompt)

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error("Error in generate-resume-suggestions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate suggestions" },
      { status: 500 }
    )
  }
} 