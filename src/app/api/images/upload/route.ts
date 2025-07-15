import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface UploadedImageResponse {
  id: string;
  url: string;
  originalName: string;
  size: number;
  type: string;
  uploadedBy: 'user';
  timestamp: string;
  metadata: {
    width?: number;
    height?: number;
    format: string;
    processedAt: string;
  };
}

// Allowed image types and max file size
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF',
          allowedTypes: ALLOWED_TYPES 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File size too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE 
        },
        { status: 400 }
      );
    }

    logger.info('Image upload request received', { 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type 
    });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const fileName = `${timestamp}-${uniqueId}${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist, that's okay
    }

    // Save file to disk
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Create response object
    const imageResponse: UploadedImageResponse = {
      id: uniqueId,
      url: `/uploads/images/${fileName}`,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: 'user',
      timestamp: new Date().toISOString(),
      metadata: {
        format: file.type.split('/')[1],
        processedAt: new Date().toISOString()
      }
    };

    logger.success('Image uploaded successfully', {
      id: imageResponse.id,
      fileName: fileName,
      size: file.size
    });

    return NextResponse.json({
      success: true,
      data: imageResponse,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    logger.error('Image upload failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Image upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - Image Upload API',
    endpoints: {
      POST: 'Upload image files',
      formData: {
        image: 'File - Image file to upload (JPEG, PNG, WebP, GIF)'
      }
    },
    limits: {
      maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
      allowedTypes: ALLOWED_TYPES
    },
    examples: {
      success: {
        id: "uuid-v4",
        url: "/uploads/images/timestamp-uuid.jpg",
        originalName: "property-photo.jpg",
        size: 2048576,
        type: "image/jpeg"
      }
    }
  });
} 