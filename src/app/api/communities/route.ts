import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/communities - Get all communities with user's membership status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: { members: true }
        },
        ...(userId && {
          members: {
            where: { userId },
            select: { id: true }
          }
        })
      },
      orderBy: {
        memberCount: 'desc'
      }
    });

    const communitiesWithStatus = communities.map(community => ({
      id: community.id,
      name: community.name,
      description: community.description,
      category: community.category,
      iconGradient: community.iconGradient,
      iconName: community.iconName,
      bannerUrl: (community as any).bannerUrl || null,
      memberCount: community._count.members,
      isJoined: userId ? community.members.length > 0 : false
    }));

    return NextResponse.json({ communities: communitiesWithStatus });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create a new community (admin only)
export async function POST(request: NextRequest) {
  try {
    const { name, description, category, iconGradient, iconName } = await request.json();

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const community = await prisma.community.create({
      data: {
        name,
        description,
        category,
        iconGradient: iconGradient || 'from-blue-500 to-cyan-500',
        iconName: iconName || 'Users',
        memberCount: 0
      }
    });

    return NextResponse.json({ community });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}
