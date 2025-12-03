import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const currentUserId = searchParams.get('currentUserId');

    if (!userId && !username) {
      return NextResponse.json(
        { error: 'userId or username is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId || '' },
          { username: username || '' },
          { nullifierHash: userId || '' },
          { walletAddress: userId || '' },
        ],
      },
      include: {
        _count: {
          select: {
            tweets: true,
            likes: true,
            retweets: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get comments count manually
    const commentsCount = await prisma.comment.count({
      where: { authorId: user.id }
    });

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    // Transform to match frontend format
    const transformedUser = {
      id: user.id,
      worldcoinId: user.worldcoinId || undefined,
      walletAddress: user.walletAddress || undefined,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio || undefined,
      avatar: user.avatar || undefined,
      profilePictureUrl: user.profilePictureUrl || undefined,
      isVerified: user.isVerified,
      isPro: user.isPro,
      isSeasonOneOG: user.isSeasonOneOG,
      createdAt: user.createdAt,
      stats: {
        tweetsCount: user._count.tweets,
        likesCount: user._count.likes,
        retweetsCount: user._count.retweets,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        commentsCount: commentsCount,
      },
      isFollowing,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
