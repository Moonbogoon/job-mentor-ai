import { InferenceClient } from "@huggingface/inference";

// Extend HfInference type to include conversational method
declare module '@huggingface/inference' {
    interface HfInference {
        conversational: (params: {
            model: string;
            inputs: {
                text: string;
                past_user_inputs: string[];
                generated_responses: string[];
            };
            parameters?: {
                max_new_tokens?: number;
                temperature?: number;
                top_p?: number;
                repetition_penalty?: number;
                do_sample?: boolean;
            };
        }) => Promise<{
            generated_text: string;
            conversation: {
                past_user_inputs: string[];
                generated_responses: string[];
            };
        }>;
    }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds
const RATE_LIMIT_DELAY = 60000; // 1 minute

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateText(prompt: string): Promise<string> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
        console.error('HUGGINGFACE_API_KEY is not set in environment variables');
        throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    let lastError: any = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Attempt ${attempt} of ${MAX_RETRIES}...`);
            const client = new InferenceClient(apiKey);
            
            console.log('Generating content...');
            const response = await client.chatCompletion({
                provider: "auto",
                model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant. Always respond with clean text only. Never include XML tags, HTML tags, or any other markup. Never include your thinking process or internal dialogue."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
            });
            
            const text = response.choices[0].message.content;
            if (!text) {
                throw new Error('No content generated from the model');
            }

            // Clean the response
            const cleanedText = text
                .replace(/<[^>]*>/g, '') // Remove any XML/HTML tags
                .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
                .replace(/^\s+|\s+$/g, '') // Trim whitespace
                .trim();

            console.log('Generated content successfully');
            return cleanedText;
        } catch (error: any) {
            console.error(`Attempt ${attempt} failed:`, error);
            lastError = error;
            
            if (error.message?.includes('429') || error.message?.includes('quota')) {
                if (attempt < MAX_RETRIES) {
                    console.log(`Rate limit hit. Waiting ${RATE_LIMIT_DELAY/1000} seconds before retry...`);
                    await delay(RATE_LIMIT_DELAY);
                    continue;
                }
                throw new Error('API rate limit exceeded. Please try again in a few minutes or upgrade your API quota.');
            }
            
            if (attempt === MAX_RETRIES) {
                throw new Error(`Failed after ${MAX_RETRIES} attempts. Last error: ${error.message}`);
            }
            
            await delay(RETRY_DELAY);
        }
    }
    
    throw lastError || new Error('Unknown error occurred');
} 