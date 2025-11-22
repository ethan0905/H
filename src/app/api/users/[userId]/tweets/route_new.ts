import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Tweet } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = decodeURIComponent(params.userId);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'tweets'; // tweets, likes, retweets
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const currentUserId = searchParams.get('currentUserId'); // For interaction status

    let tweets: any[] = [];

    switch (type) {
      case 'tweets':
        tweets = await prisma.tweet.findMany({
          where: { authorId: userId },
          include: {
            author: true,
            media: true,
            _count: {
              select: {
                likes: true,
                retweets: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        });
        break;

      case 'likes':
        const likedTweets = await prisma.like.findMany({
          where: { userId },
          include: {
            tweet: {
              include: {
                author: true,
                media: true,
                _count: {
                  select: {
                    likes: true,
                    retweets: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        });
        tweets = likedTweets.map(like => like.tweet);
        break;

      case 'retweets':
        const retweetedTweets = await prisma.retweet.findMany({
          where: { userId },
          include: {
            tweet: {
              include: {
                author: true,
                media: true,
                _count: {
                  select: {
                    likes: true,
                    retweets: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        });
        tweets = retweetedTweets.map(retweet => retweet.tweet);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be tweets, likes, or retweets' },
          { status: 400 }
        );
    }

    // Get current user interactions if provided
    let userInteractions: Record<string, { isLiked: boolean; isRetweeted: boolean }> = {};
    if (currentUserId && tweets.length > 0) {
      const tweetIds = tweets.map(tweet => tweet.id);
      const [likes, retweets] = await Promise.all([
        prisma.like.findMany({
          where: {
            userId: currentUserId,
            tweetId: { in: tweetIds },
          },
          select: { tweetId: true },
        }),
        prisma.retweet.findMany({
          where: {
            userId: currentUserId,
            tweetId: { in: tweetIds },
          },
          select: { tweetId: true },
        }),
      ]);

      const likedTweetIds = new Set(likes.map(like => like.tweetId));
      const retweetedTweetIds = new Set(retweets.map(retweet => retweet.tweetId));

      userInteractions = tweetIds.reduce((acc, tweetId) => {
        acc[tweetId] = {
          isLiked: likedTweetIds.has(tweetId),
          isRetweeted: retweetedTweetIds.has(tweetId),
        };
        return acc;
      }, {} as Record<string, { isLiked: boolean; isRetweeted: boolean }>);
    }

    // Transform to match frontend format
    const transformedTweets: Tweet[] = tweets.map(tweet => ({
      id: tweet.id,
      content: tweet.content,
      author: {
        id: tweet.author.id,
        worldcoinId: tweet.author.worldcoinId || undefined,
        walletAddress: tweet.author.walletAddress || undefined,
        username: tweet.author.username,
        displayName: tweet.author.displayName,
        bio: tweet.author.bio || undefined,
        avatar: tweet.author.avatar || undefined,
        profilePictureUrl: tweet.author.profilePictureUrl || undefined,
        isVerified: tweet.author.isVerified,
        createdAt: tweet.author.createdAt,
      },
      createdAt: tweet.createdAt.toISOString(),
      likes: tweet._count.likes,
      retweets: tweet._count.retweets,
      replies: 0,
      media: tweet.media.map((m: any) => ({
        id: m.id,
        type: m.type as 'image' | 'video',
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || undefined,
        alt: m.alt || undefined,
      })),
      isLiked: userInteractions[tweet.id]?.isLiked || false,
      isRetweeted: userInteractions[tweet.id]?.isRetweeted || false,
    }));

    return NextResponse.json({
      tweets: transformedTweets,
      total: transformedTweets.length,
    });
  } catch (error) {
    console.error('Error fetching user tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user tweets' },
      { status: 500 }
    );
  }
}
