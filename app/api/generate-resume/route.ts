import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content || ""

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error generating resume:", error)
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    )
  }
} 