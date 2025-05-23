import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
}

// Log the first few characters of the API key to verify it's being loaded
console.log('API Key loaded:', process.env.GOOGLE_AI_API_KEY.substring(0, 5) + '...');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export const geminiPro: GenerativeModel = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

export async function generateText(prompt: string) {
  try {
    console.log('Starting text generation with Gemini...');
    console.log('Prompt:', prompt.substring(0, 100) + '...');

    const result = await geminiPro.generateContent(prompt);
    console.log('Raw result:', result);

    const response = await result.response;
    console.log('Raw response:', response);

    const text = response.text();
    console.log('Generated text:', text.substring(0, 100) + '...');

    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return text;
  } catch (error: any) {
    console.error('Detailed Gemini API error:', {
      name: error.name,
      message: error.message,
      status: error.status,
      details: error.details,
      stack: error.stack,
      cause: error.cause
    });

    // Check for specific error types
    if (error.message?.includes('API key')) {
      throw new Error('Invalid or missing Google AI API key');
    } else if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded');
    } else if (error.message?.includes('permission')) {
      throw new Error('API permission denied');
    }

    throw new Error(`Gemini API error: ${error.message}`);
  }
} 