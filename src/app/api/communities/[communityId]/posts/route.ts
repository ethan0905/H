import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/communities/[communityId]/posts - Get posts for a community
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const communityId = params.communityId;

    if (!communityId) {
      return NextResponse.json(
        { error: 'Community ID is required' },
        { status: 400 }
      );
    }

    // Fetch community posts with author details
    const posts = await prisma.communityPost.findMany({
      where: {
        communityId: communityId,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform posts to match frontend format
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      communityId: post.communityId,
      replies: post._count.comments,
      author: {
        id: post.author.id,
        username: post.author.username,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
        profilePictureUrl: post.author.profilePictureUrl,
        isVerified: post.author.isVerified,
        isSeasonOneOG: post.author.isSeasonOneOG,
      },
    }));

    return NextResponse.json({
      posts: transformedPosts,
      hasMore: false,
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    );
  }
}

// POST /api/communities/[communityId]/posts - Create a post in a community
export async function POST(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { content, authorId } = await request.json();
    const communityId = params.communityId;

    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and authorId are required' },
        { status: 400 }
      );
    }

    // Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId }
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of the community
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: authorId,
          communityId: communityId
        }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this community to post' },
        { status: 403 }
      );
    }

    // Create the community post
    const post = await prisma.communityPost.create({
      data: {
        content,
        authorId,
        communityId,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Transform post to match frontend format
    const transformedPost = {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      communityId: post.communityId,
      replies: post._count.comments,
      author: {
        id: post.author.id,
        username: post.author.username,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
        profilePictureUrl: post.author.profilePictureUrl,
        isVerified: post.author.isVerified,
        isSeasonOneOG: post.author.isSeasonOneOG,
      },
    };

    return NextResponse.json({ post: transformedPost });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
