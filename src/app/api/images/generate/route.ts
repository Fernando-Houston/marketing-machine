import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import Replicate from 'replicate';

// Initialize Replicate client with validation
const initializeReplicate = () => {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    logger.warn('REPLICATE_API_TOKEN not configured - image generation will be unavailable');
    return null;
  }
  return new Replicate({ auth: token });
};

const replicate = initializeReplicate();

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

// Generate a placeholder image URL for demo purposes
const generatePlaceholderImage = (width: number, height: number, prompt: string) => {
  const baseUrl = 'https://via.placeholder.com';
  const backgroundColor = '3b82f6'; // Blue color
  const textColor = 'ffffff';
  const text = encodeURIComponent('Houston Real Estate');
  return `${baseUrl}/${width}x${height}/${backgroundColor}/${textColor}?text=${text}`;
};

const houstonRealEstatePrompts = {
  property: {
    realistic: "Houston residential property, modern architecture, professional real estate photography, bright natural lighting",
    modern: "Contemporary Houston home, clean lines, large windows, minimalist design, urban setting",
    luxury: "Luxury Houston estate, premium finishes, upscale neighborhood, professional staging",
    minimalist: "Clean modern Houston property, simple design, open spaces, neutral colors",
    professional: "Professional Houston real estate photography, well-lit property, attractive curb appeal"
  },
  marketing: {
    realistic: "Houston real estate marketing material, professional layout, property showcase, branded design",
    modern: "Modern Houston real estate flyer, contemporary graphics, clean typography, property highlights",
    luxury: "Premium Houston real estate marketing, elegant design, luxury branding, high-end presentation",
    minimalist: "Clean Houston real estate brochure, minimal design, focused content, professional layout",
    professional: "Professional Houston real estate marketing collateral, branded design, high-quality visuals"
  },
  social: {
    realistic: "Houston real estate social media post, engaging visual, property highlight, professional quality",
    modern: "Contemporary Houston real estate social content, modern graphics, eye-catching design",
    luxury: "Luxury Houston real estate social media, premium aesthetic, elegant presentation",
    minimalist: "Clean Houston real estate social post, simple design, clear messaging",
    professional: "Professional Houston real estate social media content, branded visuals, engaging layout"
  },
  logo: {
    realistic: "Houston real estate company logo, professional design, local elements, trustworthy branding",
    modern: "Modern Houston real estate logo, contemporary design, clean typography, scalable",
    luxury: "Luxury Houston real estate logo, premium branding, elegant design, sophisticated",
    minimalist: "Minimalist Houston real estate logo, simple design, clean lines, memorable",
    professional: "Professional Houston real estate company logo, corporate branding, trustworthy design"
  },
  infographic: {
    realistic: "Houston real estate market infographic, data visualization, professional charts, Houston skyline, market statistics",
    modern: "Contemporary Houston market data visualization, modern graphics, clean charts, trend indicators",
    luxury: "Premium real estate market infographic, elegant design, sophisticated data presentation, luxury branding",
    minimalist: "Clean market data infographic, simple charts, minimal design, professional layout",
    professional: "Professional Houston market analysis infographic, corporate design, data-driven visuals"
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
      promptLength: prompt.length,
      replicateAvailable: !!replicate
    });

    // Check if Replicate is available
    if (!replicate) {
      const dimensions = getImageDimensions(aspectRatio, quality);
      const placeholderUrl = generatePlaceholderImage(dimensions.width, dimensions.height, prompt);
      
      const imageResponse: ImageGenerationResponse = {
        id: Date.now().toString(),
        url: placeholderUrl,
        prompt: prompt,
        type,
        style,
        aspectRatio,
        generatedBy: 'placeholder-demo',
        timestamp: new Date().toISOString(),
        metadata: {
          model: 'placeholder-service',
          steps: 0,
          guidance_scale: 0,
          width: dimensions.width,
          height: dimensions.height
        }
      };

      logger.info('Generated placeholder image due to missing Replicate API key', {
        id: imageResponse.id,
        type,
        style
      });

      return NextResponse.json({
        success: true,
        data: imageResponse,
        message: 'Demo placeholder image generated (Replicate API not configured)'
      });
    }

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
  const isReplicateConfigured = !!replicate;
  
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - AI Image Generation API',
    status: {
      replicateConfigured: isReplicateConfigured,
      mode: isReplicateConfigured ? 'production' : 'demo-placeholder'
    },
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
    supportedQualities: ['draft', 'standard', 'premium'],
    configuration: {
      note: isReplicateConfigured 
        ? 'Replicate API configured - full AI image generation available'
        : 'Replicate API not configured - using placeholder images for demo'
    }
  });
} 