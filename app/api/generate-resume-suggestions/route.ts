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

    const prompt = `Based on the following resume content, provide 3-5 specific, actionable suggestions for improvement.
    Each suggestion should be a complete, professional sentence that can be directly used in a resume.
    Focus on creating content that highlights achievements, skills, and experiences in a compelling way.

    Resume content:
    ${content}

    Please provide suggestions that:
    1. Are complete, professional sentences
    2. Can be directly inserted into a resume
    3. Highlight specific achievements and skills
    4. Use strong action verbs
    5. Include quantifiable results where possible

    Format each suggestion as a separate line starting with a bullet point (-).
    Do not include any explanations, notes, or additional text.
    Do not include any XML tags, HTML tags, or other markup.
    Do not include any thinking process or internal dialogue.`;

    const response = await generateText(prompt)
    console.log('Raw suggestions:', response);

    // Parse suggestions into an array
    const suggestions = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.replace('-', '').trim())
      .filter(line => line.length > 0);

    console.log('Parsed suggestions:', suggestions);

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error("Error in generate-resume-suggestions:", error)
    return NextResponse.json(
      { suggestions: [
        "Add more specific achievements and metrics",
        "Include relevant technical skills",
        "Strengthen the professional summary"
      ]},
      { status: 500 }
    )
  }
} 