import { NextRequest, NextResponse } from 'next/server';
import { generateContent, GeneratedContent } from '@/lib/services/contentGeneration';
import { logger } from '@/lib/logger';

interface ContentRequest {
  topic: string;
  contentType: string;
  platform: string;
  template?: string;
}

interface BulkContentRequest {
  requests: Array<ContentRequest>;
  batchId?: string;
}

interface BulkContentResponse {
  batchId: string;
  totalRequests: number;
  successful: number;
  failed: number;
  results: Array<{
    index: number;
    success: boolean;
    data?: GeneratedContent;
    error?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkContentRequest = await request.json();
    const { requests, batchId = Date.now().toString() } = body;

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: 'Requests array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (requests.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 requests per batch allowed' },
        { status: 400 }
      );
    }

    logger.info('Bulk content generation started', { 
      batchId, 
      requestCount: requests.length 
    });

    const results: Array<{
      index: number;
      success: boolean;
      data?: GeneratedContent;
      error?: string;
    }> = [];

    let successful = 0;
    let failed = 0;

    // Process requests in parallel with concurrency limit
    const CONCURRENCY_LIMIT = 5;
    const processRequest = async (req: ContentRequest, index: number) => {
      try {
        // Validate individual request
        if (!req.topic || !req.contentType || !req.platform) {
          throw new Error('Missing required fields: topic, contentType, platform');
        }

        const generatedContent = await generateContent({
          topic: req.topic,
          contentType: req.contentType,
          platform: req.platform,
          template: req.template
        });

        results[index] = {
          index,
          success: true,
          data: generatedContent
        };
        successful++;

      } catch (error) {
        logger.error(`Bulk request ${index} failed`, error);
        results[index] = {
          index,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        failed++;
      }
    };

    // Process in batches of CONCURRENCY_LIMIT
    for (let i = 0; i < requests.length; i += CONCURRENCY_LIMIT) {
      const batch = requests.slice(i, i + CONCURRENCY_LIMIT);
      const batchPromises = batch.map((req, batchIndex) => 
        processRequest(req, i + batchIndex)
      );
      
      await Promise.all(batchPromises);
      
      // Add small delay between batches to avoid overwhelming the AI API
      if (i + CONCURRENCY_LIMIT < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const response: BulkContentResponse = {
      batchId,
      totalRequests: requests.length,
      successful,
      failed,
      results: results.sort((a, b) => a.index - b.index)
    };

    logger.success('Bulk content generation completed', {
      batchId,
      successful,
      failed,
      total: requests.length
    });

    return NextResponse.json({
      success: true,
      data: response,
      message: `Bulk generation completed: ${successful} successful, ${failed} failed`
    });

  } catch (error) {
    logger.error('Bulk content generation failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Bulk content generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - Bulk Content Generation API',
    endpoints: {
      POST: 'Generate multiple content pieces in batch',
      body: {
        requests: 'Array<{topic, contentType, platform, template?}> - Array of content requests',
        batchId: 'string - Optional batch identifier (auto-generated if not provided)'
      }
    },
    limits: {
      maxRequestsPerBatch: 50,
      concurrencyLimit: 5,
      recommendedBatchSize: '10-20 requests for optimal performance'
    },
    examples: {
      bulkGeneration: {
        requests: [
          {
            topic: 'Houston Heights luxury real estate market Q1 2025',
            contentType: 'market_update',
            platform: 'linkedin'
          },
          {
            topic: 'Energy Corridor commercial investment opportunities',
            contentType: 'investment_opportunity', 
            platform: 'instagram'
          },
          {
            topic: 'Montrose neighborhood lifestyle and dining scene',
            contentType: 'neighborhood_spotlight',
            platform: 'facebook'
          }
        ]
      }
    },
    features: [
      'Parallel processing with concurrency control',
      'Individual error handling per request',
      'Batch progress tracking',
      'Rate limiting protection',
      'Detailed success/failure reporting'
    ]
  });
} 