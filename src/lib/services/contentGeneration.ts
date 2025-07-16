import { generateHoustonContent } from '@/lib/ai/replicate';
import { generateHoustonContentBackup } from '@/lib/ai/openai';
import { logger } from '@/lib/logger';
import { serviceAvailability } from '@/lib/config';

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
  generatedBy: 'replicate' | 'openai' | 'fallback';
  timestamp: string;
}

// Fallback content templates for when AI services are unavailable
const generateFallbackContent = (topic: string, contentType: string, platform: string): string => {
  const templates = {
    market_update: {
      instagram: `🏠 Houston Real Estate Update: ${topic}

Houston continues to be one of the nation's strongest real estate markets! 

📊 Market Highlights:
• Strong demand across all price points
• New developments in key areas
• Investment opportunities growing

#HoustonRealEstate #RealEstateInvesting #HoustonLandGuys #MarketUpdate`,

      linkedin: `Houston Real Estate Market Update: ${topic}

The Houston market continues to demonstrate exceptional strength and resilience. Recent data shows sustained growth across residential and commercial sectors.

Key Market Indicators:
• Median home price: $485,000 (+12.5% YoY)
• Days on market: 28 days average
• Inventory: 2.8 months supply
• Investment demand remains robust

Houston Land Guys continues to identify prime investment opportunities for our clients. Contact us to discuss your real estate goals.

#HoustonRealEstate #MarketAnalysis #Investment`,

      facebook: `Houston Real Estate Update 🏡

Exciting news about ${topic}! The Houston market continues to offer incredible opportunities for both homebuyers and investors.

What this means for you:
✅ Strong appreciation potential
✅ Diverse investment options
✅ Growing neighborhoods
✅ Economic stability

Ready to explore Houston real estate? Let's talk!

#HoustonHomes #RealEstate #Investment`
    },

    investment_opportunity: {
      instagram: `💰 Investment Spotlight: ${topic}

Houston's real estate market is creating wealth for smart investors! 

🎯 Why Houston?
• #1 building market in America
• $43.8B in new construction
• Strong job growth
• Affordable entry points

Ready to build your portfolio? 

#RealEstateInvesting #HoustonInvestment #PassiveIncome #WealthBuilding`,

      linkedin: `Investment Opportunity Alert: ${topic}

Houston presents exceptional real estate investment opportunities driven by:

• Robust economic fundamentals
• Population growth (+2.3% annually)
• Major corporate relocations
• Infrastructure development
• Diverse industry base

Our team at Houston Land Guys specializes in identifying high-yield investment properties. We provide comprehensive market analysis and investment strategies tailored to your goals.

Schedule a consultation to explore these opportunities.`,

      facebook: `🚀 Investment Alert: ${topic}

Houston real estate investors are seeing incredible returns! Here's why:

📈 Strong market fundamentals
🏗️ Major development projects
💼 Corporate expansions
🌟 Emerging neighborhoods

Whether you're a first-time investor or expanding your portfolio, Houston offers opportunities at every level.

Let's discuss your investment strategy!`
    },

    neighborhood_spotlight: {
      instagram: `🌟 Neighborhood Spotlight: ${topic}

Discovering Houston's hidden gems! This area offers the perfect blend of lifestyle and investment potential.

✨ Highlights:
• Growing community
• Great amenities
• Strong appreciation
• Investment potential

Explore opportunities with Houston Land Guys!

#HoustonNeighborhoods #RealEstate #CommunitySpotlight`,

      linkedin: `Neighborhood Analysis: ${topic}

Our latest market analysis reveals significant opportunities in this emerging Houston area. Key factors driving growth include:

• Strategic location advantages
• Infrastructure improvements
• Demographic trends favoring growth
• Strong rental demand
• Appreciation potential

Houston Land Guys provides detailed neighborhood analysis to help clients make informed investment decisions. Contact us for comprehensive market insights.`,

      facebook: `🏘️ Neighborhood Feature: ${topic}

Love discovering Houston's amazing communities! This area has everything:

🏠 Beautiful homes
🌳 Great amenities
🏫 Excellent schools
🛍️ Shopping & dining
📈 Growing values

Thinking of buying or investing here? We'd love to show you around!`
    }
  };

  const defaultTemplate = `Houston Real Estate: ${topic}

As Houston's trusted real estate experts, Houston Land Guys brings you the latest insights about ${topic}. 

Our market analysis shows continued strength in the Houston real estate market, with opportunities for both homebuyers and investors.

Key Points:
• Market remains robust with steady growth
• Multiple opportunities across price ranges  
• Strong economic fundamentals support real estate values
• Professional guidance ensures optimal outcomes

Contact Houston Land Guys for personalized real estate solutions.

#HoustonRealEstate #Investment #MarketInsights`;

  const categoryTemplates = templates[contentType as keyof typeof templates];
  if (categoryTemplates) {
    const platformTemplate = categoryTemplates[platform as keyof typeof categoryTemplates];
    if (platformTemplate) {
      return platformTemplate;
    }
  }

  return defaultTemplate;
};

export async function generateContent({
  topic,
  contentType,
  platform,
  template
}: ContentGenerationRequest): Promise<GeneratedContent> {
  
  logger.info('Starting content generation', { 
    topic, 
    contentType, 
    platform, 
    template,
    servicesAvailable: serviceAvailability
  });
  
  let content: string;
  let generatedBy: 'replicate' | 'openai' | 'fallback';
  
  // Check if any AI services are available
  if (!serviceAvailability.replicate && !serviceAvailability.openai) {
    logger.warn('No AI services configured, using fallback content generation');
    content = generateFallbackContent(topic, contentType, platform);
    generatedBy = 'fallback';
  } else {
    try {
      // Try Replicate first (primary AI service)
      if (serviceAvailability.replicate) {
        content = await generateHoustonContent(topic, contentType);
        generatedBy = 'replicate';
        logger.success('Content generated via Replicate');
      } else {
        throw new Error('Replicate not available');
      }
      
    } catch (replicateError) {
      logger.warn('Replicate failed, trying OpenAI backup', replicateError);
      
      try {
        // Fallback to OpenAI
        if (serviceAvailability.openai) {
          content = await generateHoustonContentBackup(topic, contentType);
          generatedBy = 'openai';
          logger.success('Content generated via OpenAI backup');
        } else {
          throw new Error('OpenAI not available');
        }
        
      } catch (openaiError) {
        logger.warn('Both AI services failed, using fallback template', { replicateError, openaiError });
        content = generateFallbackContent(topic, contentType, platform);
        generatedBy = 'fallback';
        logger.success('Content generated via fallback template');
      }
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
  switch (platform) {
    case 'instagram':
      // Ensure content is concise and hashtag-friendly
      if (content.length > 2200) {
        content = content.substring(0, 2100) + '...';
      }
      break;
      
    case 'twitter':
      // Keep within Twitter's character limit
      if (content.length > 280) {
        content = content.substring(0, 250) + '... 🧵';
      }
      break;
      
    case 'linkedin':
      // Professional formatting
      content = content.replace(/([.!?])\s+/g, '$1\n\n');
      break;
      
    case 'facebook':
      // Engaging format with emojis
      if (!content.includes('📈') && !content.includes('🏠') && !content.includes('💰')) {
        content = '🏠 ' + content;
      }
      break;
      
    default:
      // No special formatting for general content
      break;
  }
  
  return content;
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
