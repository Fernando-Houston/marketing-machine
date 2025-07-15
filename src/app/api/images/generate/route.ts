import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface ImageGenerationRequest {
  prompt: string;
  type: 'property' | 'marketing' | 'social' | 'logo' | 'infographic';
  style?: 'realistic' | 'modern' | 'luxury' | 'minimalist' | 'professional';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '9:16';
  quality?: 'draft' | 'standard' | 'premium';
}

interface ImageGenerationResponse {
  id: string;
  url: string;
  prompt: string;
  type: string;
  style: string;
  aspectRatio: string;
  generatedBy: string;
  timestamp: string;
  metadata: {
    model: string;
    steps: number;
    guidance_scale: number;
    width: number;
    height: number;
  };
}

const houstonRealEstatePrompts = {
  property: {
    realistic: "Professional real estate photography of a luxury Houston home, architectural details, modern design, bright natural lighting, professional composition, high-end residential property",
    modern: "Contemporary Houston home exterior, sleek modern architecture, glass elements, clean lines, minimalist landscaping, urban setting",
    luxury: "Luxury Houston mansion, upscale architecture, grand entrance, premium materials, elegant design, exclusive neighborhood",
    minimalist: "Clean modern Houston home, simple lines, neutral colors, professional photography, minimal landscaping"
  },
  marketing: {
    realistic: "Houston real estate marketing collateral, professional layout, clean design, property photos, modern typography, Houston skyline elements",
    modern: "Contemporary real estate flyer design, Houston-themed, modern graphics, clean layout, professional presentation",
    luxury: "Premium real estate marketing materials, gold accents, elegant typography, luxury branding, high-end design",
    minimalist: "Clean real estate marketing design, white space, simple typography, professional layout, Houston branding"
  },
  social: {
    realistic: "Instagram-ready Houston real estate post, professional property photo, engaging layout, modern design elements",
    modern: "Modern social media graphic for Houston real estate, contemporary design, vibrant colors, engaging typography",
    luxury: "Luxury real estate social media post, premium design, elegant layout, high-end visual elements",
    minimalist: "Clean social media design for real estate, simple layout, professional photography, minimal text"
  },
  infographic: {
    realistic: "Houston real estate market infographic, data visualization, professional charts, Houston skyline, market statistics",
    modern: "Contemporary Houston market data visualization, modern graphics, clean charts, trend indicators",
    luxury: "Premium real estate market infographic, elegant design, sophisticated data presentation, luxury branding",
    minimalist: "Clean market data infographic, simple charts, minimal design, professional layout"
  }
};

const getImageDimensions = (aspectRatio: string, quality: string) => {
  const qualityMultiplier = {
    draft: 1,
    standard: 1.5,
    premium: 2
  }[quality] || 1;

  const baseDimensions = {
    '1:1': { width: 512, height: 512 },
    '16:9': { width: 768, height: 432 },
    '4:3': { width: 640, height: 480 },
    '9:16': { width: 432, height: 768 }
  }[aspectRatio] || { width: 512, height: 512 };

  return {
    width: Math.round(baseDimensions.width * qualityMultiplier),
    height: Math.round(baseDimensions.height * qualityMultiplier)
  };
};

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { 
      prompt, 
      type = 'property', 
      style = 'professional', 
      aspectRatio = '16:9', 
      quality = 'standard' 
    } = body;

    // Input validation
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    logger.info('Image generation request received', { 
      type, 
      style, 
      aspectRatio, 
      quality,
      promptLength: prompt.length 
    });

    // Get enhanced prompt based on type and style
    const baseStylePrompt = houstonRealEstatePrompts[type as keyof typeof houstonRealEstatePrompts]?.[style as keyof typeof houstonRealEstatePrompts.property];
    const enhancedPrompt = baseStylePrompt 
      ? `${prompt}, ${baseStylePrompt}, Houston Texas, professional quality, 4K resolution`
      : `${prompt}, Houston Texas real estate, professional photography, high quality`;

    // Get image dimensions
    const dimensions = getImageDimensions(aspectRatio, quality);

    // Generate image using Replicate SDXL
    logger.info('Generating image with Replicate SDXL', {
      model: 'stability-ai/sdxl',
      enhancedPrompt: enhancedPrompt.substring(0, 100) + '...',
      dimensions
    });

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: enhancedPrompt,
          width: dimensions.width,
          height: dimensions.height,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: quality === 'premium' ? 50 : quality === 'standard' ? 30 : 20,
          guidance_scale: 7.5,
          prompt_strength: 0.8,
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8,
          apply_watermark: false
        }
      }
    );

    // Process the output
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('No image generated from Replicate');
    }

    const imageResponse: ImageGenerationResponse = {
      id: Date.now().toString(),
      url: imageUrl as string,
      prompt: enhancedPrompt,
      type,
      style,
      aspectRatio,
      generatedBy: 'replicate-sdxl',
      timestamp: new Date().toISOString(),
      metadata: {
        model: 'stability-ai/sdxl',
        steps: quality === 'premium' ? 50 : quality === 'standard' ? 30 : 20,
        guidance_scale: 7.5,
        width: dimensions.width,
        height: dimensions.height
      }
    };

    logger.success('Image generated successfully', {
      id: imageResponse.id,
      type,
      style,
      generatedBy: 'replicate-sdxl'
    });

    return NextResponse.json({
      success: true,
      data: imageResponse,
      message: 'Image generated successfully'
    });

  } catch (error) {
    logger.error('Image generation failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Image generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - AI Image Generation API',
    endpoints: {
      POST: 'Generate Houston real estate marketing images',
      body: {
        prompt: 'string - Image description',
        type: 'string - Image type (property, marketing, social, logo, infographic)',
        style: 'string - Visual style (realistic, modern, luxury, minimalist, professional)',
        aspectRatio: 'string - Aspect ratio (1:1, 16:9, 4:3, 9:16)',
        quality: 'string - Quality level (draft, standard, premium)'
      }
    },
    examples: {
      property: {
        prompt: "Modern Houston home with large windows and contemporary design",
        type: "property",
        style: "luxury",
        aspectRatio: "16:9",
        quality: "premium"
      },
      marketing: {
        prompt: "Real estate flyer for Houston Heights luxury homes",
        type: "marketing", 
        style: "professional",
        aspectRatio: "4:3",
        quality: "standard"
      }
    },
    supportedTypes: ['property', 'marketing', 'social', 'logo', 'infographic'],
    supportedStyles: ['realistic', 'modern', 'luxury', 'minimalist', 'professional'],
    supportedRatios: ['1:1', '16:9', '4:3', '9:16'],
    supportedQualities: ['draft', 'standard', 'premium']
  });
} 