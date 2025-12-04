import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// This endpoint generates a client upload token
// The actual video upload happens directly from client to Vercel Blob
// This bypasses the 4.5MB serverless function body limit
export async function POST(request: NextRequest) {
  try {
    console.log('📹 [VIDEO-UPLOAD-TOKEN] Generating upload token');
    
    const body = (await request.json()) as HandleUploadBody;
    
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.log('🔐 [VIDEO-UPLOAD-TOKEN] Generating token for:', pathname);
        
        // You can add validation here
        // For example, check user authentication, file size limits, etc.
        
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'video/x-msvideo',
            'video/x-matroska',
            'video/mpeg'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('✅ [VIDEO-UPLOAD-TOKEN] Upload completed:', blob.url);
      },
    });
    
    console.log('✅ [VIDEO-UPLOAD-TOKEN] Token generated successfully');
    return NextResponse.json(jsonResponse);
    
  } catch (error: any) {
    console.error('❌ [VIDEO-UPLOAD-TOKEN] Error:', {
      message: error.message,
      name: error.name,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate upload token',
        details: error.message,
      },
      { status: 500 }
    );
  }
}