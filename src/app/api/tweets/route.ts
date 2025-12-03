import { NextRequest, NextResponse } from 'next/server';
import { Tweet } from '@/types';
import { prisma } from '@/lib/prisma';

// Helper function to create initial seed data
async function seedInitialData() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return; // Already seeded

  // Create seed users
  const user1 = await prisma.user.create({
    data: {
      id: 'user1',
      worldcoinId: 'world_user_1',
      username: 'alice_world',
      displayName: 'Alice',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      profilePictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      bio: 'Welcome to the future of social media! 🌍',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user2',
      worldcoinId: 'world_user_2',
      username: 'bob_crypto',
      displayName: 'Bob',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      bio: 'Crypto enthusiast and privacy advocate',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'user3',
      worldcoinId: 'world_user_3',
      username: 'dev_charlie',
      displayName: 'Charlie Dev',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      bio: 'Building the next generation of social apps',
    },
  });

  // Create seed tweets
  await prisma.tweet.create({
    data: {
      content: 'Welcome to World App! 🌍 This is the future of decentralized social media.',
      authorId: user1.id,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
  });

  await prisma.tweet.create({
    data: {
      content: 'Just verified my identity with World ID! The authentication process is seamless and secure. #WorldID #Privacy',
      authorId: user2.id,
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    },
  });

  const tweet3 = await prisma.tweet.create({
    data: {
      content: 'Building the next generation of social apps with minikit-js. The possibilities are endless! 🚀',
      authorId: user3.id,
      createdAt: new Date(Date.now() - 10800000), // 3 hours ago
    },
  });

  // Add some media to the third tweet
  await prisma.media.create({
    data: {
      tweetId: tweet3.id,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/tweets - Request received');
    
    // Ensure seed data exists
    await seedInitialData();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId'); // Optional: to get user-specific interaction status

    console.log('📊 Fetching tweets:', { limit, offset, userId });

    // Fetch tweets with user data and counts
    const tweets = await prisma.tweet.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Filter out tweets with missing authors (orphaned tweets)
    const validTweets = tweets.filter((tweet: any) => {
      if (!tweet.author) {
        console.warn(`⚠️ Tweet ${tweet.id} has missing author, skipping`);
        return false;
      }
      return true;
    });

    const totalCount = await prisma.tweet.count();

    // Get user interactions if userId provided
    let userInteractions: Record<string, { isLiked: boolean; isRetweeted: boolean }> = {};
    if (userId) {
      const tweetIds = validTweets.map((tweet: any) => tweet.id);
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

      const likedTweetIds = new Set(likes.map((like: any) => like.tweetId));
      const retweetedTweetIds = new Set(retweets.map((retweet: any) => retweet.tweetId));

      userInteractions = tweetIds.reduce((acc: any, tweetId: string) => {
        acc[tweetId] = {
          isLiked: likedTweetIds.has(tweetId),
          isRetweeted: retweetedTweetIds.has(tweetId),
        };
        return acc;
      }, {} as Record<string, { isLiked: boolean; isRetweeted: boolean }>);
    }

    // Get comment counts for all valid tweets in a single query
    const tweetIds = validTweets.map((tweet: any) => tweet.id);
    
    // Use groupBy to get counts in a single query instead of N queries
    const commentCounts = await prisma.comment.groupBy({
      by: ['tweetId'],
      where: {
        tweetId: { in: tweetIds }
      },
      _count: {
        id: true
      }
    });
    
    // Create a map for quick lookup
    const commentCountMap = commentCounts.reduce((acc: any, item) => {
      acc[item.tweetId] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Transform to match frontend format
    const transformedTweets: Tweet[] = validTweets.map((tweet: any) => ({
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

    console.log('✅ Successfully fetched tweets:', {
      count: transformedTweets.length,
      hasMore: offset + limit < totalCount,
      total: totalCount
    });

    return NextResponse.json({
      tweets: transformedTweets,
      hasMore: offset + limit < totalCount,
      total: totalCount,
    });
  } catch (error) {
    console.error('❌ Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, media, userId } = body;

    // Validate required fields
    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Content and userId are required' },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Tweet content cannot exceed 280 characters' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { nullifierHash: userId },
          { walletAddress: userId },
        ],
      },
    });

    // Update user streak
    if (user) {
      try {
        const { updateUserStreak } = await import('@/lib/streak-manager');
        await updateUserStreak(user.id);
      } catch (streakError) {
        console.error('Error updating streak:', streakError);
        // Don't fail the tweet creation if streak update fails
      }
    }

    if (!user) {
      // Create new user
      const isWorldIdUser = userId.startsWith('0x') && userId.length > 20;
      const isWalletUser = userId.startsWith('0x') && userId.length <= 20;
      
      user = await prisma.user.create({
        data: {
          id: userId,
          nullifierHash: isWorldIdUser ? userId : undefined,
          walletAddress: isWalletUser ? userId : undefined,
          worldcoinId: isWorldIdUser ? `world_${userId}` : undefined,
          username: isWorldIdUser 
            ? `human_${userId.slice(-8)}` 
            : isWalletUser 
              ? `user_${userId.slice(-8)}`
              : userId.startsWith('user') ? userId : `user_${userId}`,
          displayName: isWorldIdUser 
            ? 'Verified Human' 
            : isWalletUser 
              ? 'World User'
              : userId.startsWith('user') ? userId.charAt(0).toUpperCase() + userId.slice(1) : 'User',
          bio: isWorldIdUser 
            ? 'Verified human on World ID' 
            : isWalletUser 
              ? 'World App user'
              : 'User profile',
          avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${userId}`,
          profilePictureUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${userId}`,
          isVerified: isWorldIdUser || ['user1', 'user2', 'user3'].includes(userId),
          verificationLevel: isWorldIdUser ? 'orb' : undefined,
        },
      });
    }

    // Create tweet with media
    const tweet = await prisma.tweet.create({
      data: {
        content,
        authorId: user.id,
        media: media && media.length > 0 ? {
          create: media.map((item: any) => ({
            type: item.type,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl,
            alt: item.alt,
          }))
        } : undefined,
      },
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
    });

    // Transform to match frontend format
    const transformedTweet: Tweet = {
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
      replies: 0, // Comment count for newly created tweet
      media: tweet.media.map((m: any) => ({
        id: m.id,
        type: m.type as 'image' | 'video',
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || undefined,
        alt: m.alt || undefined,
      })),
      isLiked: false,
      isRetweeted: false,
    };

    return NextResponse.json(transformedTweet, { status: 201 });
  } catch (error) {
    console.error('Error creating tweet:', error);
    return NextResponse.json(
      { error: 'Failed to create tweet' },
      { status: 500 }
    );
  }
}
