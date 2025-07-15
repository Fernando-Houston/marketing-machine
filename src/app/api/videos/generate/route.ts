import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface VideoGenerationRequest {
  type: 'property_tour' | 'market_animation' | 'showcase_video' | 'social_content';
  prompt: string;
  inputImage?: string; // Base image for video generation
  duration?: number; // Video duration in seconds
  style?: 'realistic' | 'cinematic' | 'drone_view' | 'professional' | 'social_media';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  quality?: 'draft' | 'standard' | 'premium';
  houstonArea?: string;
  propertyType?: 'residential' | 'commercial' | 'land' | 'mixed_use';
}

interface VideoGenerationResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  generatedBy: 'stable-video-diffusion';
  timestamp: string;
  metadata: {
    duration: number;
    fileSize?: string;
    format: 'mp4';
    width: number;
    height: number;
    fps: number;
    houstonArea?: string;
    propertyType?: string;
  };
}

// Houston-specific video prompts for different types
const houstonVideoPrompts = {
  property_tour: {
    residential: {
      realistic: "smooth cinematic tour of a beautiful Houston home, warm lighting, modern interior design, flowing camera movement through living spaces",
      cinematic: "dramatic cinematic property tour with golden hour lighting, Houston skyline visible through windows, professional real estate cinematography",
      drone_view: "aerial drone footage of Houston residential property, smooth orbiting movement, neighborhood context, professional real estate videography",
      professional: "professional real estate tour with steady camera movements, well-lit interiors, clean modern spaces, Houston home showcase",
      social_media: "engaging property tour perfect for Instagram and TikTok, dynamic movements, bright natural lighting, Houston real estate content"
    },
    commercial: {
      realistic: "professional commercial property walkthrough, Houston business district, modern office spaces, clean corporate environment",
      cinematic: "cinematic commercial real estate tour, Houston downtown skyline, dramatic lighting, professional architecture showcase",
      drone_view: "aerial view of Houston commercial development, sweeping drone movements, urban landscape, professional real estate footage",
      professional: "corporate property presentation, Houston commercial spaces, professional lighting, clean business environment tour",
      social_media: "dynamic commercial property showcase for social media, Houston business district, engaging visual tour"
    },
    land: {
      realistic: "smooth camera movement across Houston development land, natural lighting, clear property boundaries, development potential showcase",
      cinematic: "cinematic land development showcase, Houston growth areas, dramatic sky, investment opportunity presentation",
      drone_view: "aerial survey of Houston development land, property boundaries visible, neighborhood context, investment showcase",
      professional: "professional land development presentation, Houston growth corridors, clear property visualization, investment focus",
      social_media: "engaging land development content for social platforms, Houston investment opportunities, dynamic visual presentation"
    }
  },
  market_animation: {
    realistic: "animated Houston real estate market data visualization, clean charts and graphs, professional market analysis presentation",
    cinematic: "dramatic Houston market trend animation with city backdrop, dynamic data visualization, professional market intelligence",
    professional: "corporate market analysis animation, Houston real estate statistics, clean data presentation, investment insights",
    social_media: "engaging Houston market trends animation for social media, dynamic charts, eye-catching data visualization"
  },
  showcase_video: {
    realistic: "Houston real estate showcase with multiple properties, smooth transitions, professional presentation, market highlights",
    cinematic: "cinematic Houston real estate portfolio showcase, dramatic lighting, premium property highlights, luxury presentation",
    professional: "professional Houston real estate company showcase, clean branding, multiple property types, corporate presentation",
    social_media: "dynamic Houston real estate showcase for social platforms, engaging transitions, multiple property highlights"
  },
  social_content: {
    social_media: "eye-catching Houston real estate content optimized for Instagram, TikTok, and Facebook, dynamic movements, engaging visuals"
  }
};

// Get video dimensions based on aspect ratio and quality
const getVideoDimensions = (aspectRatio: string, quality: string) => {
  const qualityMultiplier = quality === 'premium' ? 1 : quality === 'standard' ? 0.8 : 0.6;
  
  const baseDimensions = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:3': { width: 1440, height: 1080 }
  };
  
  const base = baseDimensions[aspectRatio as keyof typeof baseDimensions];
  return {
    width: Math.round(base.width * qualityMultiplier),
    height: Math.round(base.height * qualityMultiplier)
  };
};

// Generate enhanced prompt based on type and style
const generateEnhancedPrompt = (
  type: string, 
  prompt: string, 
  style: string = 'professional',
  houstonArea?: string,
  propertyType: string = 'residential'
) => {
  let enhancedPrompt = prompt;

  // Add Houston-specific styling based on type
  if (type === 'property_tour') {
    const tourPrompts = houstonVideoPrompts.property_tour;
    if (propertyType === 'residential' && tourPrompts.residential[style as keyof typeof tourPrompts.residential]) {
      enhancedPrompt = `${prompt}, ${tourPrompts.residential[style as keyof typeof tourPrompts.residential]}`;
    } else if (propertyType === 'commercial' && tourPrompts.commercial[style as keyof typeof tourPrompts.commercial]) {
      enhancedPrompt = `${prompt}, ${tourPrompts.commercial[style as keyof typeof tourPrompts.commercial]}`;
    } else if (propertyType === 'land' && tourPrompts.land[style as keyof typeof tourPrompts.land]) {
      enhancedPrompt = `${prompt}, ${tourPrompts.land[style as keyof typeof tourPrompts.land]}`;
    }
  } else if (type === 'market_animation') {
    const marketPrompts = houstonVideoPrompts.market_animation;
    if (marketPrompts[style as keyof typeof marketPrompts]) {
      enhancedPrompt = `${prompt}, ${marketPrompts[style as keyof typeof marketPrompts]}`;
    }
  } else if (type === 'showcase_video') {
    const showcasePrompts = houstonVideoPrompts.showcase_video;
    if (showcasePrompts[style as keyof typeof showcasePrompts]) {
      enhancedPrompt = `${prompt}, ${showcasePrompts[style as keyof typeof showcasePrompts]}`;
    }
  } else if (type === 'social_content') {
    const socialPrompts = houstonVideoPrompts.social_content;
    if (socialPrompts[style as keyof typeof socialPrompts]) {
      enhancedPrompt = `${prompt}, ${socialPrompts[style as keyof typeof socialPrompts]}`;
    }
  }

  // Add Houston-specific context
  if (houstonArea) {
    enhancedPrompt += `, located in ${houstonArea}, Houston, Texas`;
  } else {
    enhancedPrompt += `, Houston, Texas real estate`;
  }

  // Add technical video requirements
  enhancedPrompt += `, smooth camera movement, high quality, professional cinematography, 4K resolution`;

  return enhancedPrompt;
};

export async function POST(request: NextRequest) {
  try {
    const body: VideoGenerationRequest = await request.json();
    const { 
      type, 
      prompt, 
      inputImage,
      duration = 5,
      style = 'professional', 
      aspectRatio = '16:9', 
      quality = 'standard',
      houstonArea,
      propertyType = 'residential'
    } = body;

    // Input validation
    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Prompt and type are required' },
        { status: 400 }
      );
    }

    logger.info('Video generation request received', { 
      type, 
      style, 
      aspectRatio, 
      quality,
      duration,
      houstonArea,
      propertyType,
      hasInputImage: !!inputImage
    });

    // Get enhanced prompt based on type and style
    const enhancedPrompt = generateEnhancedPrompt(type, prompt, style, houstonArea, propertyType);

    // Get video dimensions
    const dimensions = getVideoDimensions(aspectRatio, quality);

    logger.info('Generating video with Stable Video Diffusion', {
      model: 'stable-video-diffusion-img2vid-xt',
      enhancedPrompt: enhancedPrompt.substring(0, 100) + '...',
      dimensions,
      duration
    });

    let output;

    if (inputImage) {
      // Generate video from image using Stable Video Diffusion
      output = await replicate.run(
        "stability-ai/stable-video-diffusion:3f0457e4619daec7b2bb482d97b4244b6c6fc9c42ab3ad05a5c10b7e8c5d6b1b",
        {
          input: {
            input_image: inputImage,
            sizing_strategy: "maintain_aspect_ratio",
            frames_per_second: quality === 'premium' ? 24 : quality === 'standard' ? 18 : 12,
            motion_bucket_id: 127,
            noise_aug_strength: 0.1,
            seed: Math.floor(Math.random() * 1000000),
            decoding_t: 3,
            video_length: duration
          }
        }
      );
    } else {
      // Generate video from text prompt using alternative video model
      output = await replicate.run(
        "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c2e7c6dfa00a7e4db58b0b3c8dacccd5f56b76",
        {
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "blurry, low quality, distorted, amateur, poor lighting, shaky camera",
            width: dimensions.width,
            height: dimensions.height,
            num_frames: duration * 8, // Approximate frames for duration
            num_inference_steps: quality === 'premium' ? 50 : quality === 'standard' ? 30 : 20,
            guidance_scale: 17.5,
            fps: quality === 'premium' ? 24 : 18,
            batch_size: 1
          }
        }
      );
    }

    // Process the output
    const videoUrl = Array.isArray(output) ? output[0] : output;
    
    if (!videoUrl) {
      throw new Error('No video generated from Replicate');
    }

    const videoResponse: VideoGenerationResponse = {
      id: Date.now().toString(),
      url: videoUrl as string,
      type,
      prompt: enhancedPrompt,
      style,
      aspectRatio,
      generatedBy: 'stable-video-diffusion',
      timestamp: new Date().toISOString(),
      metadata: {
        duration,
        format: 'mp4',
        width: dimensions.width,
        height: dimensions.height,
        fps: quality === 'premium' ? 24 : quality === 'standard' ? 18 : 12,
        houstonArea,
        propertyType
      }
    };

    logger.success('Video generated successfully', {
      id: videoResponse.id,
      type,
      style,
      duration,
      generatedBy: 'stable-video-diffusion'
    });

    return NextResponse.json({
      success: true,
      data: videoResponse,
      message: 'Video generated successfully'
    });

  } catch (error) {
    logger.error('Video generation failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Video generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - AI Video Generation API',
    endpoints: {
      POST: 'Generate Houston real estate videos using AI',
      body: {
        type: 'string - Video type (property_tour, market_animation, showcase_video, social_content)',
        prompt: 'string - Video description',
        inputImage: 'string - Base image URL for video generation (optional)',
        duration: 'number - Video duration in seconds (default: 5)',
        style: 'string - Visual style (realistic, cinematic, drone_view, professional, social_media)',
        aspectRatio: 'string - Video aspect ratio (16:9, 9:16, 1:1, 4:3)',
        quality: 'string - Video quality (draft, standard, premium)',
        houstonArea: 'string - Specific Houston area',
        propertyType: 'string - Property type (residential, commercial, land, mixed_use)'
      }
    },
    videoTypes: {
      property_tour: 'Cinematic property walkthroughs and tours',
      market_animation: 'Animated market data and trend visualizations',
      showcase_video: 'Property portfolio and company showcases',
      social_content: 'Short-form videos optimized for social media platforms'
    },
    styles: {
      realistic: 'Natural, realistic property footage',
      cinematic: 'Dramatic, high-end cinematic presentation',
      drone_view: 'Aerial and overhead perspectives',
      professional: 'Clean, corporate-style presentations',
      social_media: 'Engaging content optimized for social platforms'
    },
    propertyTypes: {
      residential: 'Single-family homes, townhomes, condos',
      commercial: 'Office buildings, retail, industrial spaces',
      land: 'Development land and investment opportunities',
      mixed_use: 'Multi-purpose developments'
    },
    features: [
      'Stable Video Diffusion for high-quality video generation',
      'Houston-specific prompts and styling',
      'Multiple aspect ratios for different platforms',
      'Property type-specific video generation',
      'Professional cinematography styles',
      'Social media optimized content'
    ],
    examples: {
      property_tour: {
        prompt: "Beautiful modern Houston home with open floor plan and large windows",
        type: "property_tour",
        style: "cinematic",
        aspectRatio: "16:9",
        houstonArea: "The Woodlands",
        propertyType: "residential"
      },
      social_content: {
        prompt: "Quick tour of luxury Houston Heights property",
        type: "social_content",
        style: "social_media",
        aspectRatio: "9:16",
        duration: 3,
        propertyType: "residential"
      }
    }
  });
} 