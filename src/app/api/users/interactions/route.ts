import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tweetIds = searchParams.get('tweetIds')?.split(',') || [];
    const type = searchParams.get('type'); // 'likes' or 'retweets'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // If tweetIds provided, return interactions for those tweets (legacy)
    if (tweetIds.length > 0) {
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
    }

    // Fetch all user's liked and retweeted tweets
    const [likedTweets, retweetedTweets] = await Promise.all([
      prisma.like.findMany({
        where: { userId },
        include: {
          tweet: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  profilePictureUrl: true,
                  isVerified: true,
                  verificationLevel: true,
                }
              },
              _count: {
                select: {
                  likes: true,
                  retweets: true,
                  comments: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.retweet.findMany({
        where: { userId },
        include: {
          tweet: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  profilePictureUrl: true,
                  isVerified: true,
                  verificationLevel: true,
                }
              },
              _count: {
                select: {
                  likes: true,
                  retweets: true,
                  comments: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Transform to match Tweet format
    const likes = likedTweets.map(like => ({
      id: like.tweet.id,
      content: like.tweet.content,
      author: like.tweet.author,
      createdAt: like.tweet.createdAt,
      likes: like.tweet._count.likes,
      retweets: like.tweet._count.retweets,
      replies: like.tweet._count.comments,
      isLiked: true,
      isRetweeted: false,
      media: [],
    }));

    const retweets = retweetedTweets.map(retweet => ({
      id: retweet.tweet.id,
      content: retweet.tweet.content,
      author: retweet.tweet.author,
      createdAt: retweet.tweet.createdAt,
      likes: retweet.tweet._count.likes,
      retweets: retweet.tweet._count.retweets,
      replies: retweet.tweet._count.comments,
      isLiked: false,
      isRetweeted: true,
      media: [],
    }));

    return NextResponse.json({ likes, retweets });
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}
