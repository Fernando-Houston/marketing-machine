import OpenAI from 'openai';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

const openai = new OpenAI({
  apiKey: config.apis.openai,
});

export async function generateContentBackup(prompt: string): Promise<string> {
  try {
    logger.info('Generating content with OpenAI (backup)', { prompt: prompt.substring(0, 100) });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a Houston real estate expert creating marketing content for Houston Land Guys. Focus on investment opportunities, market trends, and data-driven insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content || '';
    logger.success('Content generated successfully via OpenAI');
    return result;
    
  } catch (error) {
    logger.error('OpenAI API failed', error);
    throw new Error('OpenAI content generation failed');
  }
}

export async function generateHoustonContentBackup(topic: string, contentType: string): Promise<string> {
  const houstonPrompt = `Create ${contentType} content about ${topic} for Houston real estate market.

Guidelines:
- Houston is America's #1 building market
- Focus on investment opportunities
- Mention Houston Land Guys expertise
- Use local market data and trends
- Professional but engaging tone

Topic: ${topic}
Content Type: ${contentType}

Write the content:`;

  return generateContentBackup(houstonPrompt);
}
