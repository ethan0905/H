import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tweetId, action } = body;

    if (!userId || !tweetId || !action) {
      return NextResponse.json(
        { error: 'userId, tweetId, and action are required' },
        { status: 400 }
      );
    }

    if (!['like', 'unlike', 'retweet', 'unretweet'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be like, unlike, retweet, or unretweet' },
        { status: 400 }
      );
    }

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
    });

    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404 }
      );
    }

    let result;

    switch (action) {
      case 'like':
        // Create like (upsert to avoid duplicates)
        result = await prisma.like.upsert({
          where: {
            userId_tweetId: {
              userId,
              tweetId,
            },
          },
          update: {},
          create: {
            userId,
            tweetId,
          },
        });
        break;

      case 'unlike':
        // Remove like
        result = await prisma.like.delete({
          where: {
            userId_tweetId: {
              userId,
              tweetId,
            },
          },
        }).catch(() => null); // Ignore if doesn't exist
        break;

      case 'retweet':
        // Create retweet (upsert to avoid duplicates)
        result = await prisma.retweet.upsert({
          where: {
            userId_tweetId: {
              userId,
              tweetId,
            },
          },
          update: {},
          create: {
            userId,
            tweetId,
          },
        });
        break;

      case 'unretweet':
        // Remove retweet
        result = await prisma.retweet.delete({
          where: {
            userId_tweetId: {
              userId,
              tweetId,
            },
          },
        }).catch(() => null); // Ignore if doesn't exist
        break;
    }

    // Get updated counts
    const [likesCount, retweetsCount] = await Promise.all([
      prisma.like.count({ where: { tweetId } }),
      prisma.retweet.count({ where: { tweetId } }),
    ]);

    return NextResponse.json({
      success: true,
      action,
      counts: {
        likes: likesCount,
        retweets: retweetsCount,
      },
    });
  } catch (error) {
    console.error('Error handling tweet interaction:', error);
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    );
  }
}
