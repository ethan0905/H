import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { pipeline } from 'stream/promises';

const execAsync = promisify(exec);

// Configure route to handle large files and long execution time
export const runtime = 'nodejs';
export const maxDuration = 120; // Maximum 120 seconds for function execution (increased for large videos)

// Disable body size limit for this route (required for large video uploads)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[VIDEO UPLOAD] Starting video upload...');
    const startTime = Date.now();
    
    // Parse form data
    const formData = await request.formData();
    const video = formData.get('video') as File;
    
    if (!video) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 });
    }

    console.log(`[VIDEO UPLOAD] Received: ${video.name}, size: ${(video.size / 1024 / 1024).toFixed(2)}MB, type: ${video.type}`);

    // Validate file type
    if (!video.type.startsWith('video/')) {
      console.log('[VIDEO UPLOAD] Error: Invalid file type');
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
    }

    // Validate file size (max 100MB for raw video)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (video.size > maxSize) {
      console.log('[VIDEO UPLOAD] Error: File too large');
      return NextResponse.json({ error: 'Video size must be less than 100MB' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
      console.log('[VIDEO UPLOAD] Created uploads directory');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(video.name) || '.mp4';
    const originalFilename = `${timestamp}-${randomString}${ext}`;
    const originalFilePath = path.join(uploadsDir, originalFilename);

    // Save the video file efficiently
    console.log('[VIDEO UPLOAD] Converting to buffer...');
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('[VIDEO UPLOAD] Writing to disk...');
    await writeFile(originalFilePath, buffer);
    console.log('[VIDEO UPLOAD] Video saved successfully at:', originalFilePath);

    // Generate thumbnail using ffmpeg (first frame)
    const thumbnailFilename = `${timestamp}-${randomString}-thumb.jpg`;
    const thumbnailPath = path.join(uploadsDir, thumbnailFilename);
    
    try {
      // Check if ffmpeg is available
      await execAsync('which ffmpeg');
      
      // Generate thumbnail at 1 second mark
      await execAsync(
        `ffmpeg -i "${originalFilePath}" -ss 00:00:01 -vframes 1 -vf "scale=640:-1" "${thumbnailPath}"`
      );
    } catch (error) {
      console.error('ffmpeg not available or thumbnail generation failed:', error);
      // Continue without thumbnail - it's optional
    }

    // Check video duration using ffmpeg
    try {
      const { stdout } = await execAsync(
        `ffmpeg -i "${originalFilePath}" 2>&1 | grep "Duration" | cut -d ' ' -f 4 | sed s/,//`
      );
      
      const duration = stdout.trim();
      const [hours, minutes, seconds] = duration.split(':').map(parseFloat);
      const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
      
      // Check if video is longer than 2 minutes (120 seconds)
      if (totalSeconds > 120) {
        return NextResponse.json({ 
          error: 'Video duration must be 2 minutes or less' 
        }, { status: 400 });
      }
    } catch (error) {
      console.error('Could not determine video duration:', error);
      // Continue anyway - duration check is optional
    }

    // Return URLs
    const videoUrl = `/uploads/videos/${originalFilename}`;
    const thumbnailUrl = existsSync(thumbnailPath) 
      ? `/uploads/videos/${thumbnailFilename}` 
      : null;

    const elapsed = Date.now() - startTime;
    console.log(`[VIDEO UPLOAD] ✅ Complete in ${elapsed}ms`);
    console.log(`[VIDEO UPLOAD] Video URL: ${videoUrl}`);
    console.log(`[VIDEO UPLOAD] Thumbnail URL: ${thumbnailUrl || 'none'}`);

    // Return response with explicit headers to prevent connection issues
    return new NextResponse(JSON.stringify({
      url: videoUrl,
      thumbnailUrl,
      filename: originalFilename,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'close', // Explicitly close connection after response
      },
    });

  } catch (error: any) {
    console.error('[VIDEO UPLOAD] ❌ Error:', error);
    console.error('[VIDEO UPLOAD] Error stack:', error.stack);
    
    // Check for specific error types
    if (error.code === 'ECONNRESET') {
      console.error('[VIDEO UPLOAD] Connection reset - possible timeout or network issue');
      return new NextResponse(JSON.stringify({
        error: 'Connection was reset during upload. File might be too large or connection interrupted.'
      }), {
        status: 408,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'close',
        },
      });
    }
    
    if (error.name === 'PayloadTooLargeError') {
      console.error('[VIDEO UPLOAD] Payload too large');
      return new NextResponse(JSON.stringify({
        error: 'Video file is too large. Maximum size is 100MB.'
      }), {
        status: 413,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'close',
        },
      });
    }
    
    return new NextResponse(JSON.stringify({
      error: 'Failed to upload video. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'close',
      },
    });
  }
}
