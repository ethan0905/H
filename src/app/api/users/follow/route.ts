import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId are required' },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if users exist
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId } }),
      prisma.user.findUnique({ where: { id: followingId } }),
    ]);

    if (!follower || !following) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    let isFollowing: boolean;
    let action: string;

    if (existingFollow) {
      // Unfollow - remove the relationship
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      isFollowing = false;
      action = 'unfollowed';
    } else {
      // Follow - create the relationship
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      isFollowing = true;
      action = 'followed';
    }

    // Get updated follower counts
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId } }),
      prisma.follow.count({ where: { followerId } }),
    ]);

    return NextResponse.json({
      success: true,
      isFollowing,
      action,
      counts: {
        followers: followersCount,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error('Error handling follow action:', error);
    return NextResponse.json(
      { error: 'Failed to process follow action' },
      { status: 500 }
    );
  }
}
