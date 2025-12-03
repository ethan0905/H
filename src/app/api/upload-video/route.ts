import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for video uploads

// Maximum video size: 50MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📹 [VIDEO-UPLOAD] Request received');
    
    const formData = await request.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      console.error('❌ [VIDEO-UPLOAD] No video file provided');
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    console.log('📋 [VIDEO-UPLOAD] Video details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: sizeInMB + ' MB'
    });

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska', 'video/mpeg'];
    if (!file.type.startsWith('video/') && !validTypes.includes(file.type)) {
      console.error('❌ [VIDEO-UPLOAD] Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid video format. Supported: MP4, MOV, WebM, AVI, MKV' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      console.error('❌ [VIDEO-UPLOAD] File too large:', file.size);
      return NextResponse.json(
        { error: `Video size must be less than ${MAX_VIDEO_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    console.log('✅ [VIDEO-UPLOAD] Validation passed, starting upload...');

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'mp4';
    const filename = `videos/${timestamp}-${randomString}.${extension}`;

    console.log('☁️  [VIDEO-UPLOAD] Uploading to Vercel Blob:', filename);

    // Upload video directly to Vercel Blob Storage (no buffer conversion for speed)
    const videoBlob = await put(filename, file, {
      access: 'public',
      contentType: file.type || 'video/mp4',
    });

    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [VIDEO-UPLOAD] Upload completed in ${uploadTime}s:`, videoBlob.url);

    return NextResponse.json({
      url: videoBlob.url,
      thumbnailUrl: null,
      success: true,
      filename: filename,
      size: file.size,
      type: file.type,
      uploadTime: uploadTime
    });

  } catch (error: any) {
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ [VIDEO-UPLOAD] Upload failed after ${uploadTime}s:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}
