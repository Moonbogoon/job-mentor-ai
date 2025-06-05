import { HfInference } from '@huggingface/inference';

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
            const hf = new HfInference(apiKey);
            
            console.log('Generating content...');
            const response = await hf.textGeneration({
                model: "facebook/opt-350m",
                inputs: `You are a helpful AI assistant. Please provide a detailed and accurate response to the following request:

${prompt}`,
                parameters: {
                    max_new_tokens: 1024,
                    temperature: 0.7,
                    top_p: 0.95,
                    repetition_penalty: 1.1,
                    do_sample: true,
                }
            });
            
            const text = response.generated_text;
            console.log('Generated content successfully');
            return text;
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