import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/communities/join - Join a community
export async function POST(request: NextRequest) {
  try {
    const { userId, communityId } = await request.json();

    if (!userId || !communityId) {
      return NextResponse.json(
        { error: 'Missing userId or communityId' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this community' },
        { status: 400 }
      );
    }

    // Join the community
    const member = await prisma.communityMember.create({
      data: {
        userId,
        communityId
      }
    });

    // Increment member count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        memberCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined community',
      member
    });
  } catch (error) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { error: 'Failed to join community' },
      { status: 500 }
    );
  }
}
