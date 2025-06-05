import { NextResponse } from "next/server"
import { generateText } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }

    const prompt = `Create a professional resume based on the following job description. 
    Focus on matching the job requirements and using industry-specific keywords.

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
  } catch (error: any) {
    console.error("Error in generate-resume:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate resume" },
      { status: 500 }
    )
  }
} 