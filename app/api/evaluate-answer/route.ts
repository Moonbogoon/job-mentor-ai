import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { question, answer, resumeContent } = await request.json()

    const prompt = `Evaluate the following interview answer based on the candidate's resume and the question asked. Provide specific feedback on strengths, areas for improvement, and overall assessment.

Question: ${question}

Answer: ${answer}

Resume Context:
${resumeContent}

Please provide feedback in the following JSON format:
{
  "strengths": ["List of specific strengths in the answer"],
  "improvements": ["List of specific areas that could be improved"],
  "overall": "Overall assessment of the answer, including how well it aligns with their experience and the question asked"
}

Focus on:
1. Relevance to the question
2. Use of specific examples from their experience
3. Clarity and structure of the response
4. Alignment with their resume content
5. Areas where they could provide more detail or better examples`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = completion.choices[0]?.message?.content || "{}"
    const feedback = JSON.parse(content)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error evaluating answer:", error)
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    )
  }
} 