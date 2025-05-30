// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateText(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set in environment variables');
        throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
        console.log('Initializing Gemini API...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        console.log('Generating content...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Generated content:', text);
        return text;
    } catch (error) {
        console.error('Error in generateText:', error);
        throw error;
    }
}
  