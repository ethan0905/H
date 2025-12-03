import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { tweetId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get the tweet to check ownership
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      include: { author: true },
    });

    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404 }
      );
    }

    // Get the requesting user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is the author or super admin
    const isAuthor = tweet.authorId === userId;
    const isSuperAdmin = user.isSuperAdmin === true;

    if (!isAuthor && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this tweet' },
        { status: 403 }
      );
    }

    // Delete the tweet (cascade will delete associated media, likes, retweets, comments)
    await prisma.tweet.delete({
      where: { id: tweetId },
    });

    return NextResponse.json({
      success: true,
      message: isSuperAdmin && !isAuthor 
        ? 'Tweet deleted by super admin' 
        : 'Tweet deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return NextResponse.json(
      { error: 'Failed to delete tweet' },
      { status: 500 }
    );
  }
}
