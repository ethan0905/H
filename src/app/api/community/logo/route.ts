import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put, del } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST - Upload community logo (super admin only)
export async function POST(request: NextRequest) {
  try {
    console.log('📤 Community logo upload request received');
    
    const formData = await request.formData();
    const logo = formData.get('logo') as File;
    const communityId = formData.get('communityId') as string;
    const userId = formData.get('userId') as string;

    if (!logo || !communityId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only super admins can upload community logos' },
        { status: 403 }
      );
    }

    // Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Validate file type
    if (!logo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for logo)
    if (logo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Logo size must be less than 5MB' },
        { status: 400 }
      );
    }

    // If community already has a logo, delete the old one
    if ((community as any).logoUrl) {
      try {
        await del((community as any).logoUrl);
      } catch (error) {
        console.error('Failed to delete old logo:', error);
        // Continue anyway
      }
    }

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `logos/${communityId}-${timestamp}-${randomString}.jpg`;
    
    const blob = await put(filename, logo, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Update community with logo URL
    await prisma.community.update({
      where: { id: communityId },
      data: { logoUrl: blob.url } as any,
    });

    console.log('✅ Community logo updated successfully');

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Error uploading community logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

// GET - Fetch community with logo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');

    if (!communityId) {
      return NextResponse.json(
        { error: 'Missing communityId' },
        { status: 400 }
      );
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        bannerUrl: true,
      } as any,
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
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

// DELETE - Remove community logo (super admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');
    const userId = searchParams.get('userId');

    if (!communityId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only super admins can remove community logos' },
        { status: 403 }
      );
    }

    // Get community
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Delete logo from Vercel Blob if exists
    if ((community as any).logoUrl) {
      try {
        await del((community as any).logoUrl);
      } catch (error) {
        console.error('Failed to delete logo from storage:', error);
        // Continue to update database anyway
      }
    }

    // Remove logo URL from community
    await prisma.community.update({
      where: { id: communityId },
      data: { logoUrl: null } as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing community logo:', error);
    return NextResponse.json(
      { error: 'Failed to remove logo' },
      { status: 500 }
    );
  }
}
