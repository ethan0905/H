import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Community banner upload request received');
    
    const formData = await request.formData();
    const image = formData.get('banner') as File;
    const communityId = formData.get('communityId') as string;
    const userId = formData.get('userId') as string;
    
    console.log('📋 Upload params:', { communityId, userId, imageSize: image?.size });
    
    if (!image || !communityId || !userId) {
      console.error('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true, username: true },
    });

    console.log('👤 User check:', { isSuperAdmin: user?.isSuperAdmin, username: user?.username });

    if (!user?.isSuperAdmin) {
      console.error('❌ Unauthorized: Not a super admin');
      return NextResponse.json({ 
        error: 'Unauthorized: Super admin access required' 
      }, { status: 403 });
    }

    // Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      console.error('❌ Community not found:', communityId);
      return NextResponse.json({ 
        error: 'Community not found' 
      }, { status: 404 });
    }

    console.log('✅ Community found:', community.name);

    // Validate file type
    if (!image.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', image.type);
      return NextResponse.json({ 
        error: 'File must be an image' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB for banner)
    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      console.error('❌ File too large:', image.size);
      return NextResponse.json({ 
        error: 'Image size must be less than 10MB' 
      }, { status: 400 });
    }

    // Process image with sharp
    console.log('🔄 Processing image with sharp...');
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Resize and optimize banner (1500x500 for wide banner)
    const processedBuffer = await sharp(buffer)
      .resize(1500, 500, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    console.log('✅ Image processed, size:', processedBuffer.length);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `banners/${communityId}-${timestamp}-${randomString}.jpg`;

    console.log('☁️  Uploading to Vercel Blob:', filename);

    // Upload to Vercel Blob Storage
    const blob = await put(filename, processedBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log('✅ Uploaded to Blob:', blob.url);

    // Update community with banner URL
    await prisma.community.update({
      where: { id: communityId },
      data: { bannerUrl: blob.url },
    });

    console.log('✅ Community banner updated successfully');

    return NextResponse.json({
      url: blob.url,
      filename,
    });

  } catch (error) {
    console.error('Error uploading community banner:', error);
    return NextResponse.json(
      { error: 'Failed to upload banner' },
      { status: 500 }
    );
  }
}

// Get community with banner
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');

    if (!communityId) {
      return NextResponse.json({ 
        error: 'Community ID required' 
      }, { status: 400 });
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        iconGradient: true,
        iconName: true,
        bannerUrl: true,
        memberCount: true,
      },
    });

    if (!community) {
      return NextResponse.json({ 
        error: 'Community not found' 
      }, { status: 404 });
    }

    return NextResponse.json(community);

  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}

// Delete community banner (super admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');
    const userId = searchParams.get('userId');

    if (!communityId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true },
    });

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ 
        error: 'Unauthorized: Super admin access required' 
      }, { status: 403 });
    }

    // Remove banner URL from community
    await prisma.community.update({
      where: { id: communityId },
      data: { bannerUrl: null },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Banner removed successfully' 
    });

  } catch (error) {
    console.error('Error removing community banner:', error);
    return NextResponse.json(
      { error: 'Failed to remove banner' },
      { status: 500 }
    );
  }
}
