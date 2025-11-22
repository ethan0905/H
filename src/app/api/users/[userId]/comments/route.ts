import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[userId]/comments - Get tweets that user has commented on
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    
    // Get all tweets the user has commented on
    const comments = await prisma.comment.findMany({
      where: {
        authorId: params.userId,
      },
      include: {
        tweet: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
                avatar: true,
                isVerified: true,
                worldcoinId: true,
                walletAddress: true,
                verificationLevel: true,
              },
            },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get unique tweets (in case user commented multiple times on same tweet)
    const uniqueTweetIds = [...new Set(comments.map(comment => comment.tweetId))];
    const tweets = await prisma.tweet.findMany({
      where: {
        id: { in: uniqueTweetIds },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePictureUrl: true,
            avatar: true,
            isVerified: true,
            worldcoinId: true,
            walletAddress: true,
            verificationLevel: true,
          },
        },
        media: true,
        _count: {
          select: {
            likes: true,
            retweets: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user interactions if currentUserId provided
    let userInteractions: Record<string, { isLiked: boolean; isRetweeted: boolean }> = {};
    if (currentUserId) {
      const tweetIds = tweets.map((tweet: any) => tweet.id);
      const [likes, retweets] = await Promise.all([
        prisma.like.findMany({
          where: {
            userId: currentUserId,
            tweetId: { in: tweetIds },
          },
        }),
        prisma.retweet.findMany({
          where: {
            userId: currentUserId,
            tweetId: { in: tweetIds },
          },
        }),
      ]);

      const likedTweetIds = new Set(likes.map((like: any) => like.tweetId));
      const retweetedTweetIds = new Set(retweets.map((retweet: any) => retweet.tweetId));

      userInteractions = tweetIds.reduce((acc: any, tweetId: string) => {
        acc[tweetId] = {
          isLiked: likedTweetIds.has(tweetId),
          isRetweeted: retweetedTweetIds.has(tweetId),
        };
        return acc;
      }, {});
    }

    // Get comment counts for all tweets
    const tweetIds = tweets.map((tweet: any) => tweet.id);
    const commentCounts = await Promise.all(
      tweetIds.map(async (tweetId: string) => {
        const count = await prisma.comment.count({
          where: { tweetId }
        });
        return { tweetId, count };
      })
    );
    const commentCountMap = commentCounts.reduce((acc: any, { tweetId, count }) => {
      acc[tweetId] = count;
      return acc;
    }, {});

    // Transform to match frontend format
    const transformedTweets = tweets.map((tweet: any) => ({
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
      replies: commentCountMap[tweet.id] || 0,
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

    return NextResponse.json({ tweets: transformedTweets });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user comments' },
      { status: 500 }
    );
  }
}
