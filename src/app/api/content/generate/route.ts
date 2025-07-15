import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/services/contentGeneration';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, contentType, platform, template } = body;

    // Input validation
    if (!topic || !contentType || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, contentType, platform' },
        { status: 400 }
      );
    }

    logger.info('Content generation request received', { topic, contentType, platform });

    // Generate content using AI
    const generatedContent = await generateContent({
      topic,
      contentType,
      platform,
      template
    });

    logger.success('Content generated successfully', { 
      topic, 
      generatedBy: generatedContent.generatedBy 
    });
    
    return NextResponse.json({
      success: true,
      data: generatedContent,
      message: `Content generated successfully via ${generatedContent.generatedBy}`
    });
    
  } catch (error) {
    logger.error('Content generation failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Content generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - Content Generation API',
    endpoints: {
      POST: 'Generate content with AI',
      body: {
        topic: 'string - Content topic',
        contentType: 'string - Type of content to generate',
        platform: 'string - Target platform (instagram, facebook, linkedin, twitter)',
        template: 'string - Optional template to use'
      }
    },
    examples: {
      topic: 'Houston Heights real estate investment',
      contentType: 'market_update',
      platform: 'instagram'
    }
  });
}
