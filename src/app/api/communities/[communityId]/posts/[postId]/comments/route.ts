import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/communities/[communityId]/posts/[postId]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    const postId = params.postId;

    const comments = await prisma.communityPostComment.findMany({
      where: {
        postId: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            profilePictureUrl: true,
            isVerified: true,
            isSeasonOneOG: true,
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

// POST /api/communities/[communityId]/posts/[postId]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const { content, authorId } = await request.json();
    const postId = params.postId;
    const communityId = params.communityId;

    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
        { status: 400 }
      );
    }

    // Verify user is a member of the community
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: authorId,
          communityId: communityId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You must join the community before commenting' },
        { status: 403 }
      );
    }

    // Create comment
    const comment = await prisma.communityPostComment.create({
      data: {
        content,
        authorId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            profilePictureUrl: true,
            isVerified: true,
            isSeasonOneOG: true,
          },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
