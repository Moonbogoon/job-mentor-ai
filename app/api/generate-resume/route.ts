import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const { jobTitle, experience, skills } = await request.json()

    if (!jobTitle || !experience || !skills) {
      return NextResponse.json(
        { error: "Job title, experience, and skills are required" },
        { status: 400 }
      )
    }

    const prompt = `Create a professional resume based on the following information.
    Focus on creating a compelling and well-structured resume that highlights the candidate's strengths.

    Job Title: ${jobTitle}
    Experience: ${experience}
    Skills: ${skills}

    Please create a professional resume with the following sections:
    1. Professional Summary - A compelling introduction that aligns with the job title and experience
    2. Key Skills - Highlight the provided skills and any relevant technical competencies
    3. Professional Experience - Create relevant experience entries based on the provided experience
    4. Education - Include a standard education section

    Make sure to:
    - Use industry-specific keywords
    - Emphasize relevant achievements and responsibilities
    - Keep the content professional and concise
    - Focus on transferable skills
    - Use action verbs and quantifiable achievements where possible

    Format the response as a clean, professional resume with appropriate sections.
    Do not include any explanations, notes, or additional text.
    Do not include any XML tags, HTML tags, or other markup.
    Do not include any thinking process or internal dialogue.`;

    const content = await generateText(prompt)
    console.log('Raw generated content:', content);

    // Clean up the response
    const cleanedContent = content
      .replace(/<[^>]*>/g, '') // Remove any XML/HTML tags
      .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .trim();

    return NextResponse.json({ content: cleanedContent })
  } catch (error: any) {
    console.error("Error in generate-resume:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate resume" },
      { status: 500 }
    )
  }
} 