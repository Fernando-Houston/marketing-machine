import { generateHoustonContent } from '@/lib/ai/replicate';
import { generateHoustonContentBackup } from '@/lib/ai/openai';
import { logger } from '@/lib/logger';

export interface ContentGenerationRequest {
  topic: string;
  contentType: string;
  platform: string;
  template?: string;
}

export interface GeneratedContent {
  content: string;
  topic: string;
  contentType: string;
  platform: string;
  generatedBy: 'replicate' | 'openai';
  timestamp: string;
}

export async function generateContent({
  topic,
  contentType,
  platform,
  template
}: ContentGenerationRequest): Promise<GeneratedContent> {
  
  logger.info('Starting content generation', { topic, contentType, platform });
  
  let content: string;
  let generatedBy: 'replicate' | 'openai';
  
  try {
    // Try Replicate first (primary AI service)
    content = await generateHoustonContent(topic, contentType);
    generatedBy = 'replicate';
    logger.success('Content generated via Replicate');
    
  } catch (replicateError) {
    logger.warn('Replicate failed, trying OpenAI backup', replicateError);
    
    try {
      // Fallback to OpenAI
      content = await generateHoustonContentBackup(topic, contentType);
      generatedBy = 'openai';
      logger.success('Content generated via OpenAI backup');
      
    } catch (openaiError) {
      logger.error('Both AI services failed', { replicateError, openaiError });
      throw new Error('All AI content generation services failed');
    }
  }
  
  // Platform-specific formatting
  const formattedContent = formatContentForPlatform(content, platform);
  
  return {
    content: formattedContent,
    topic,
    contentType,
    platform,
    generatedBy,
    timestamp: new Date().toISOString()
  };
}

function formatContentForPlatform(content: string, platform: string): string {
  switch (platform.toLowerCase()) {
    case 'instagram':
      // Instagram: Add hashtags and emojis
      return `${content}\n\n#HoustonRealEstate #HoustonLandGuys #RealEstateInvesting #Houston #PropertyInvestment`;
      
    case 'facebook':
      // Facebook: Longer form, more descriptive
      return content;
      
    case 'linkedin':
      // LinkedIn: Professional tone, industry insights
      return `${content}\n\n---\nHouston Land Guys - Your trusted Houston real estate investment partner`;
      
    case 'twitter':
      // Twitter: Truncate if needed
      return content.length > 240 ? content.substring(0, 237) + '...' : content;
      
    default:
      return content;
  }
}

// Houston-specific content templates
export const HOUSTON_CONTENT_TYPES = {
  MARKET_UPDATE: 'market_update',
  INVESTMENT_OPPORTUNITY: 'investment_opportunity',
  NEIGHBORHOOD_SPOTLIGHT: 'neighborhood_spotlight',
  MARKET_ANALYSIS: 'market_analysis',
  QUICK_TIP: 'quick_tip',
  PROPERTY_LISTING: 'property_listing'
} as const;
