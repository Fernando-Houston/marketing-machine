export const config = {
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./temp.db',
  },
  apis: {
    replicate: process.env.REPLICATE_API_TOKEN || '',
    openai: process.env.OPENAI_API_KEY || '',
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID || '',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
    },
  },
  app: {
    name: 'Houston Marketing Machine',
    version: '2.0',
    environment: process.env.NODE_ENV || 'development',
  },
};

// Check which services are available
export const serviceAvailability = {
  replicate: !!config.apis.replicate,
  openai: !!config.apis.openai,
  instagram: !!config.apis.instagram.accessToken,
  facebook: !!config.apis.facebook.accessToken,
  linkedin: !!config.apis.linkedin.accessToken,
};

// Validate required environment variables with graceful degradation
export function validateConfig() {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Critical services - will degrade gracefully if missing
  if (!config.apis.replicate) {
    warnings.push('REPLICATE_API_TOKEN not configured - image/video generation will be unavailable');
  }
  
  if (!config.apis.openai) {
    warnings.push('OPENAI_API_KEY not configured - AI content generation fallback will be unavailable');
  }

  // Optional services
  if (!config.apis.instagram.accessToken) {
    warnings.push('Instagram API not configured - social media integration limited');
  }

  if (!config.apis.facebook.accessToken) {
    warnings.push('Facebook API not configured - social media integration limited');
  }

  if (!config.apis.linkedin.accessToken) {
    warnings.push('LinkedIn API not configured - social media integration limited');
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('Configuration warnings:');
    warnings.forEach(warning => console.warn('⚠️ ', warning));
  }

  // Only throw errors for critical missing config in production
  if (errors.length > 0 && config.app.environment === 'production') {
    throw new Error(`Critical configuration errors: ${errors.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    services: serviceAvailability
  };
}
