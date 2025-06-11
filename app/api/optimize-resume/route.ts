import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }

    const prompt = `Optimize the following resume content to better match the job description.
    Focus on highlighting relevant skills, experiences, and achievements that align with the job requirements.

    Job Description:
    ${jobDescription}

    Please provide an optimized version of the resume that:
    1. Emphasizes relevant skills and experiences
    2. Uses keywords from the job description
    3. Highlights achievements that match the job requirements
    4. Maintains a professional tone
    5. Is well-structured and easy to read

    Important:
    - Provide ONLY the optimized resume content
    - Do not include any explanations or notes
    - Do not include any thinking process or internal dialogue
    - Do not include any XML tags, HTML tags, or other markup
    - Format the content as a clean, professional resume with appropriate sections
    - Each section should be clearly separated with a newline
    - Use bullet points for achievements and responsibilities
    - Keep the content concise and impactful`;

    const content = await generateText(prompt)
    console.log('Raw optimized content:', content);

    // Clean up the response
    const cleanedContent = content
      .replace(/<[^>]*>/g, '') // Remove any XML/HTML tags
      .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/^[•\-\*]\s*/gm, '• ') // Standardize bullet points
      .trim();

    return NextResponse.json({ content: cleanedContent })
  } catch (error: any) {
    console.error("Error in optimize-resume:", error)
    return NextResponse.json(
      { error: error.message || "Failed to optimize resume" },
      { status: 500 }
    )
  }
} 