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

IMPORTANT: Your response must be a valid JSON array of strings. Each string should be a suggestion.
Example format:
["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]`

    const responseContent = await generateText(prompt)
    console.log('Raw response:', responseContent);

    let suggestions: string[];
    try {
      suggestions = JSON.parse(responseContent);
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
      if (suggestions.length === 0) {
        throw new Error('Empty suggestions array');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback: Try to extract suggestions from text
      suggestions = responseContent
        .split('\n')
        .filter(line => line.trim().startsWith('"') || line.trim().startsWith('-'))
        .map(line => line.replace(/^["-]\s*/, '').replace(/["\s]*$/, ''))
        .filter(Boolean);
      
      if (suggestions.length === 0) {
        throw new Error('Failed to parse suggestions from response');
      }
    }

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error("Error generating suggestions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate suggestions" },
      { status: 500 }
    )
  }
} 