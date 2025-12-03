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
export const maxDuration = 60; // Maximum 60 seconds for function execution

// Disable body size limit for this route (required for large video uploads)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting video upload...');
    
    // Parse form data
    const formData = await request.formData();
    const video = formData.get('video') as File;
    
    if (!video) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 });
    }

    console.log(`Received video: ${video.name}, size: ${video.size} bytes, type: ${video.type}`);

    // Validate file type
    if (!video.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
    }

    // Validate file size (max 100MB for raw video)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (video.size > maxSize) {
      return NextResponse.json({ error: 'Video size must be less than 100MB' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(video.name) || '.mp4';
    const originalFilename = `${timestamp}-${randomString}${ext}`;
    const originalFilePath = path.join(uploadsDir, originalFilename);

    // Save the video file efficiently
    console.log('Converting to buffer...');
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('Writing to disk...');
    await writeFile(originalFilePath, buffer);
    console.log('Video saved successfully at:', originalFilePath);

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

    return NextResponse.json({
      url: videoUrl,
      thumbnailUrl,
      filename: originalFilename,
    });

  } catch (error: any) {
    console.error('Error uploading video:', error);
    
    // Check for specific error types
    if (error.code === 'ECONNRESET') {
      return NextResponse.json(
        { error: 'Connection was reset during upload. File might be too large or connection interrupted.' },
        { status: 408 }
      );
    }
    
    if (error.name === 'PayloadTooLargeError') {
      return NextResponse.json(
        { error: 'Video file is too large. Maximum size is 100MB.' },
        { status: 413 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to upload video. Please try again.' },
      { status: 500 }
    );
  }
}
