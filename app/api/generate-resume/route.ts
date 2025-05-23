import { NextResponse } from "next/server"
import { generateText } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { jobTitle, experience, skills } = await request.json()

    const prompt = `Create a professional resume for a ${jobTitle} position. 
    
Experience Summary:
${experience}

Key Skills:
${skills}

Please format the resume in a clean, professional style with the following sections:
1. Professional Summary
2. Skills
3. Professional Experience
4. Education (include a generic but realistic education background)

Make the content specific to the job title and experience provided, but keep it professional and concise.`

    const content = await generateText(prompt)

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error generating resume:", error)
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    )
  }
} 