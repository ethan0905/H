import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tweetIds = searchParams.get('tweetIds')?.split(',') || [];

    if (!userId || tweetIds.length === 0) {
      return NextResponse.json(
        { error: 'userId and tweetIds are required' },
        { status: 400 }
      );
    }

    // Get user's likes and retweets for these tweets
    const [likes, retweets] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId,
          tweetId: { in: tweetIds },
        },
        select: { tweetId: true },
      }),
      prisma.retweet.findMany({
        where: {
          userId,
          tweetId: { in: tweetIds },
        },
        select: { tweetId: true },
      }),
    ]);

    const likedTweetIds = new Set(likes.map(like => like.tweetId));
    const retweetedTweetIds = new Set(retweets.map(retweet => retweet.tweetId));

    const interactions = tweetIds.reduce((acc, tweetId) => {
      acc[tweetId] = {
        isLiked: likedTweetIds.has(tweetId),
        isRetweeted: retweetedTweetIds.has(tweetId),
      };
      return acc;
    }, {} as Record<string, { isLiked: boolean; isRetweeted: boolean }>);

    return NextResponse.json({ interactions });
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}
