/**
 * Leaderboards API Route
 * 
 * Fetch leaderboard data for display in the UI
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'GLOBAL_TOP_HUMANS';
    const region = searchParams.get('region');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Find the most recent snapshot for this type
    const whereClause: any = { type };
    if (region) {
      whereClause.region = region;
    }

    const snapshot = await prisma.leaderboardSnapshot.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        entries: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                profilePictureUrl: true,
                currentRank: true,
                isVerified: true,
              },
            },
          },
          orderBy: { rankPosition: 'asc' },
          take: limit,
        },
      },
    });

    if (!snapshot) {
      return NextResponse.json(
        { error: 'No leaderboard data available yet' },
        { status: 404 }
      );
    }

    // Format entries
    const entries = snapshot.entries.map((entry: any) => ({
      userId: entry.user.id,
      username: entry.user.username,
      displayName: entry.user.displayName,
      avatar: entry.user.avatar || entry.user.profilePictureUrl,
      currentRank: entry.user.currentRank,
      isVerified: entry.user.isVerified,
      rankPosition: entry.rankPosition,
      score: entry.score,
      scoreBreakdown: entry.metadata ? JSON.parse(entry.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      leaderboard: {
        type: snapshot.type,
        region: snapshot.region,
        regionType: snapshot.regionType,
        periodStart: snapshot.periodStart,
        periodEnd: snapshot.periodEnd,
        entries,
        totalEntries: entries.length,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
