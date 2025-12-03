import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Maximum video size: 50MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    console.log('📹 Video upload request received');
    
    const formData = await request.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      console.error('❌ No video file provided');
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    console.log('📋 Video details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    // Validate file type
    if (!file.type.startsWith('video/')) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json(
        { error: `Video size must be less than ${MAX_VIDEO_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('✅ Video buffer created, size:', buffer.length);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'mp4';
    const filename = `videos/${timestamp}-${randomString}.${extension}`;

    console.log('☁️  Uploading video to Vercel Blob:', filename);

    // Upload video to Vercel Blob Storage
    const videoBlob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
    });

    console.log('✅ Video uploaded:', videoBlob.url);

    // For videos, we'll create a simple thumbnail using the first frame
    // Note: For a more robust solution, you might want to use a service like FFmpeg
    // For now, we'll return a placeholder or try to extract the first frame
    let thumbnailUrl = null;

    try {
      // Try to create a thumbnail from the first frame if it's a common video format
      // This is a simplified approach - in production you might want to use FFmpeg
      console.log('🖼️  Attempting to create video thumbnail...');
      
      // For now, we'll skip thumbnail generation for videos
      // and just return the video URL
      console.log('⚠️  Video thumbnail generation skipped (requires FFmpeg)');
      
      // You can use a default video placeholder thumbnail or generate one later
      thumbnailUrl = null;
    } catch (thumbError) {
      console.error('⚠️  Failed to create video thumbnail:', thumbError);
      // Continue without thumbnail
    }

    console.log('✅ Video upload completed successfully');

    return NextResponse.json({
      url: videoBlob.url,
      thumbnailUrl: thumbnailUrl,
      success: true,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ Video upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
