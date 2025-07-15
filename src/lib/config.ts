export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  apis: {
    replicate: process.env.REPLICATE_API_TOKEN!,
    openai: process.env.OPENAI_API_KEY!,
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID!,
      appSecret: process.env.FACEBOOK_APP_SECRET!,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN!,
    },
  },
  app: {
    name: 'Houston Marketing Machine',
    version: '2.0',
    environment: process.env.NODE_ENV || 'development',
  },
};

// Validate required environment variables
export function validateConfig() {
  const requiredVars = [
    'DATABASE_URL',
    'REPLICATE_API_TOKEN',
    'OPENAI_API_KEY',
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
