import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple in-memory store for community posts (temporary solution)
// In production, add communityId field to Tweet model or create CommunityPost table
const communityPostsMap = new Map<string, string[]>();

// GET /api/communities/[communityId]/posts - Get posts for a community
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const communityId = params.communityId;

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

    // Get tweet IDs for this community
    const tweetIds = communityPostsMap.get(communityId) || [];
    
    if (tweetIds.length === 0) {
      return NextResponse.json({
        posts: [],
        hasMore: false,
        community: {
          id: community.id,
          name: community.name,
          description: community.description
        }
      });
    }

    // Fetch the actual tweets
    const tweets = await prisma.tweet.findMany({
      where: {
        id: { in: tweetIds }
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
            verificationLevel: true,
          }
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            comments: true,
          }
        },
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true }
          },
          retweets: {
            where: { userId },
            select: { id: true }
          }
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to match expected format
    const posts = tweets.map(tweet => ({
      id: tweet.id,
      content: tweet.content,
      author: tweet.author,
      createdAt: tweet.createdAt,
      likes: tweet._count.likes,
      retweets: tweet._count.retweets,
      replies: tweet._count.comments,
      isLiked: userId ? (tweet.likes?.length || 0) > 0 : false,
      isRetweeted: userId ? (tweet.retweets?.length || 0) > 0 : false,
      media: [],
    }));

    return NextResponse.json({
      posts,
      hasMore: false,
      community: {
        id: community.id,
        name: community.name,
        description: community.description
      }
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

    // Create the tweet
    const tweet = await prisma.tweet.create({
      data: {
        content,
        authorId,
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
    });

    // Store the mapping of this tweet to the community
    const existingPosts = communityPostsMap.get(communityId) || [];
    communityPostsMap.set(communityId, [tweet.id, ...existingPosts]);

    // Transform to match expected format
    const post = {
      id: tweet.id,
      content: tweet.content,
      author: tweet.author,
      createdAt: tweet.createdAt,
      likes: tweet._count.likes,
      retweets: tweet._count.retweets,
      replies: tweet._count.comments,
      isLiked: false,
      isRetweeted: false,
      media: [],
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
