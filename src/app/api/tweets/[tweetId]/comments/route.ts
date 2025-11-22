import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tweets/[tweetId]/comments - Get comments for a tweet
export async function GET(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    
    const comments = await prisma.comment.findMany({
      where: {
        tweetId: params.tweetId,
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/tweets/[tweetId]/comments - Add a comment to a tweet
export async function POST(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { content, authorId } = await request.json();

    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Comment must be 280 characters or less' },
        { status: 400 }
      );
    }

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id: params.tweetId },
    });

    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404 }
      );
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId,
        tweetId: params.tweetId,
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
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
