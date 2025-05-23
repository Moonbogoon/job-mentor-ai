import { NextResponse } from "next/server"
import { generateText } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const { question, answer, resumeContent } = await request.json()

    const prompt = `Evaluate the following interview answer based on the candidate's resume and the question asked. Provide specific feedback on strengths, areas for improvement, and overall assessment.

Question: ${question}

Answer: ${answer}

Resume Context:
${resumeContent}

IMPORTANT: Your response must be a valid JSON object with the following structure:
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

    const content = await generateText(prompt)
    console.log('Raw response:', content);

    let feedback: { strengths: string[], improvements: string[], overall: string };
    try {
      feedback = JSON.parse(content);
      if (!feedback.strengths || !feedback.improvements || !feedback.overall) {
        throw new Error('Invalid feedback structure');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback: Create structured feedback from text
      const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
      const strengths: string[] = [];
      const improvements: string[] = [];
      let overall = '';
      let currentSection = '';

      for (const line of lines) {
        if (line.toLowerCase().includes('strength')) {
          currentSection = 'strengths';
        } else if (line.toLowerCase().includes('improvement')) {
          currentSection = 'improvements';
        } else if (line.toLowerCase().includes('overall')) {
          currentSection = 'overall';
        } else if (line.startsWith('-') || line.startsWith('•')) {
          const item = line.replace(/^[-•]\s*/, '');
          if (currentSection === 'strengths') {
            strengths.push(item);
          } else if (currentSection === 'improvements') {
            improvements.push(item);
          }
        } else if (currentSection === 'overall') {
          overall += line + ' ';
        }
      }

      feedback = {
        strengths: strengths.length > 0 ? strengths : ['No specific strengths identified'],
        improvements: improvements.length > 0 ? improvements : ['No specific improvements identified'],
        overall: overall.trim() || 'No overall assessment provided'
      };
    }

    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error("Error evaluating answer:", error)
    return NextResponse.json(
      { error: error.message || "Failed to evaluate answer" },
      { status: 500 }
    )
  }
} 