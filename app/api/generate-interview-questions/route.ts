import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { resumeContent } = await request.json()

    const prompt = `Based on the following resume, generate 5 relevant interview questions that would help assess the candidate's qualifications, experience, and fit for the role. The questions should be specific to their background and experience.

Resume:
${resumeContent}

Generate 5 interview questions that:
1. Are specific to the candidate's experience and skills
2. Include both technical and behavioral questions
3. Help assess their problem-solving abilities
4. Evaluate their communication skills
5. Gauge their career goals and motivations

Format the response as a JSON array of strings, with each string being a question.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content || "[]"
    const questions = JSON.parse(content)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    )
  }
} 