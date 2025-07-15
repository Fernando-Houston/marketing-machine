export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },
  
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },
  
  success: (message: string, data?: unknown) => {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`, data || '');
  },
};

// Custom error class for application errors
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}
