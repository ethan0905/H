import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('banner') as File;
    const communityId = formData.get('communityId') as string;
    const userId = formData.get('userId') as string;
    
    if (!image || !communityId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
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

    // Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ 
        error: 'Community not found' 
      }, { status: 404 });
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'File must be an image' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB for banner)
    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json({ 
        error: 'Image size must be less than 10MB' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${communityId}-${timestamp}-${randomString}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Process image with sharp
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Resize and optimize banner (1500x500 for wide banner)
    await sharp(buffer)
      .resize(1500, 500, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(filepath);

    // Update community with banner URL
    const bannerUrl = `/uploads/banners/${filename}`;
    await prisma.community.update({
      where: { id: communityId },
      data: { bannerUrl },
    });

    return NextResponse.json({
      url: bannerUrl,
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
