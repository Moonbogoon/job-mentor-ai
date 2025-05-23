import { NextResponse } from "next/server"
import { generateText } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json()

    const prompt = `Analyze the following job description and create a tailored resume that highlights the most relevant skills and experiences. Focus on matching the job requirements and using industry-specific keywords.

Job Description:
${jobDescription}

Please create a professional resume with the following sections:
1. Professional Summary - A compelling introduction that aligns with the job requirements
2. Key Skills - Highlight skills that match the job description
3. Professional Experience - Include relevant experience that demonstrates the required qualifications
4. Education - Include a standard education section

Make sure to:
- Use keywords from the job description
- Emphasize relevant achievements and responsibilities
- Keep the content professional and concise
- Focus on transferable skills that match the job requirements
- Use action verbs and quantifiable achievements where possible`

    const content = await generateText(prompt)

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error optimizing resume:", error)
    return NextResponse.json(
      { error: "Failed to optimize resume" },
      { status: 500 }
    )
  }
} 