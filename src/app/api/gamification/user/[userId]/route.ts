/**
 * User Rank API Route
 * 
 * Fetch user rank, progress, and tags
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collectUserStats } from '@/lib/gamification/statsService';
import { computeRankForUser, getRankDisplayName } from '@/lib/gamification/rankService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        profilePictureUrl: true,
        currentRank: true,
        rankScore: true,
        isVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user tags
    const userTags = await prisma.userTag.findMany({
      where: { userId },
      include: {
        tag: {
          include: {
            season: true,
          },
        },
      },
      orderBy: { grantedAt: 'desc' },
    });

    // Compute current rank progress
    const stats = await collectUserStats(userId);
    const rankResult = computeRankForUser(stats);

    // Format tags
    const tags = userTags.map((ut: any) => ({
      id: ut.tag.id,
      name: ut.tag.name,
      description: ut.tag.description,
      isLimited: ut.tag.isLimited,
      seasonName: ut.tag.season?.name,
      seasonTheme: ut.tag.season?.theme,
      grantedAt: ut.grantedAt,
      reason: ut.reason,
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar || user.profilePictureUrl,
        isVerified: user.isVerified,
      },
      rank: {
        current: user.currentRank,
        currentDisplayName: getRankDisplayName(user.currentRank as any),
        score: user.rankScore,
        nextRank: rankResult.nextRank,
        nextRankDisplayName: rankResult.nextRank ? getRankDisplayName(rankResult.nextRank) : null,
        progressToNext: rankResult.progressToNext,
        requirements: rankResult.requirements,
      },
      tags,
      stats: {
        streakDays: stats.streakDays,
        totalTweets: stats.totalTweets,
        totalComments: stats.totalComments,
        avgEngagement: stats.avgEngagementPerPost,
        successfulInvites: stats.successfulInvitesCount,
      },
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user rank',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
