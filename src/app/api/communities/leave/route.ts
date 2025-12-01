import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/communities/leave - Leave a community
export async function POST(request: NextRequest) {
  try {
    const { userId, communityId } = await request.json();

    if (!userId || !communityId) {
      return NextResponse.json(
        { error: 'Missing userId or communityId' },
        { status: 400 }
      );
    }

    // Leave the community
    await prisma.communityMember.deleteMany({
      where: {
        userId,
        communityId
      }
    });

    // Decrement member count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        memberCount: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Successfully left community'
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    return NextResponse.json(
      { error: 'Failed to leave community' },
      { status: 500 }
    );
  }
}
