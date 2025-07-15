import Replicate from 'replicate';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

const replicate = new Replicate({
  auth: config.apis.replicate,
});

export async function generateContent(prompt: string): Promise<string> {
  try {
    logger.info('Generating content with Replicate', { prompt: prompt.substring(0, 100) });
    
    const output = await replicate.run(
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      {
        input: {
          prompt: prompt,
          max_new_tokens: 500,
          temperature: 0.7,
          repetition_penalty: 1.1,
        }
      }
    );

    const result = Array.isArray(output) ? output.join('') : String(output);
    logger.success('Content generated successfully via Replicate');
    return result;
    
  } catch (error) {
    logger.error('Replicate API failed', error);
    throw new Error('Replicate content generation failed');
  }
}

export async function generateHoustonContent(topic: string, contentType: string): Promise<string> {
  const houstonPrompt = `You are a Houston real estate expert writing ${contentType} content about ${topic}.

Key Context:
- Houston is the #1 building market in America with 46,269 permits and $43.8B in contracts
- Focus on investment opportunities and market trends
- Mention Houston Land Guys as the local expert
- Use data-driven insights and local market knowledge

Write engaging, professional content that highlights Houston's real estate opportunities.

Topic: ${topic}
Content Type: ${contentType}

Content:`;

  return generateContent(houstonPrompt);
}
