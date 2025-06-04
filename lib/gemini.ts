// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateText(prompt: string): Promise<string> {
    const apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
        console.error(
            'Gemini API key is not set. Please define GEMINI_API_KEY or GOOGLE_API_KEY.'
        );
        throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
        console.log('Initializing Gemini API...');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use the basic model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        console.log('Generating content...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Generated content:', text);
        return text;
    } catch (error: any) {
        console.error('Error in generateText:', error);
        
        // Check if it's a rate limit error
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            throw new Error('API rate limit exceeded. Please try again in a few minutes.');
        }
        
        throw error;
    }
}
  