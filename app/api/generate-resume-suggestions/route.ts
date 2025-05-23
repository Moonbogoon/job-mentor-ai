import { NextResponse } from "next/server"
import { generateText } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { section, content: currentContent } = await request.json()

    const sectionPrompts = {
      introduction: `Generate 5 professional introduction phrases for a resume. Each phrase should be concise, impactful, and highlight the candidate's key strengths and career objectives.`,
      experience: `Generate 5 professional experience bullet points that demonstrate achievements and responsibilities. Each point should start with a strong action verb and include quantifiable results where possible.`,
      skills: `Generate 5 skill descriptions that showcase technical expertise and soft skills. Each description should be specific and demonstrate proficiency level.`,
      closing: `Generate 5 professional closing statements for a resume that summarize key qualifications and express enthusiasm for opportunities.`,
    }

    const prompt = `${sectionPrompts[section as keyof typeof sectionPrompts]}

Current content for reference:
${currentContent}

Format the response as a JSON array of strings, with each string being a suggestion.`

    const responseContent = await generateText(prompt)
    const suggestions = JSON.parse(responseContent)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    )
  }
} 