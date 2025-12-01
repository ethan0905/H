/**
 * Leaderboard Update Job
 * 
 * Scheduled job to generate leaderboard snapshots.
 * Should run weekly for weekly leaderboards, and can also generate monthly/all-time.
 */

import { prisma } from '@/lib/prisma';
import { collectUserStats, collectWeeklyUserStats } from './statsService';
import { computeLeaderboardScore } from './leaderboardService';
import { LeaderboardType } from '@/types/gamification';

/**
 * Generate a global leaderboard snapshot
 */
export async function generateGlobalLeaderboard(
  type: LeaderboardType,
  periodStart: Date,
  periodEnd: Date
): Promise<string> {
  console.log(`📊 Generating ${type} leaderboard...`);

  // Get all verified users
  const users = await prisma.user.findMany({
    where: { isVerified: true },
    select: { id: true, totalEarnings: true },
  });

  console.log(`Found ${users.length} verified users`);

  // Collect stats and compute scores
  const scores: Array<{
    userId: string;
    score: number;
    metadata: string;
  }> = [];

  for (const user of users) {
    try {
      const stats = await collectUserStats(user.id);
      const scoreBreakdown = computeLeaderboardScore(type, {
        ...stats,
        totalEarnings: user.totalEarnings,
      });

      scores.push({
        userId: user.id,
        score: scoreBreakdown.total,
        metadata: JSON.stringify(scoreBreakdown),
      });
    } catch (error) {
      console.error(`Failed to compute score for user ${user.id}:`, error);
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Take top 100
  const topScores = scores.slice(0, 100);

  // Create snapshot
  const snapshot = await prisma.leaderboardSnapshot.create({
    data: {
      type,
      periodStart,
      periodEnd,
      entries: {
        create: topScores.map((s, index) => ({
          userId: s.userId,
          rankPosition: index + 1,
          score: s.score,
          metadata: s.metadata,
        })),
      },
    },
  });

  console.log(`✅ Created ${type} snapshot with ${topScores.length} entries`);
  return snapshot.id;
}

/**
 * Generate regional leaderboards (by country, city, language)
 */
export async function generateRegionalLeaderboards(
  type: LeaderboardType,
  periodStart: Date,
  periodEnd: Date
): Promise<string[]> {
  console.log(`🌍 Generating regional leaderboards for ${type}...`);

  const snapshotIds: string[] = [];

  // Group by country
  const countries = await prisma.user.groupBy({
    by: ['country'],
    where: {
      isVerified: true,
      country: { not: null },
    },
    _count: true,
  });

  for (const { country } of countries) {
    if (!country) continue;

    const snapshotId = await generateRegionalLeaderboard(
      type,
      periodStart,
      periodEnd,
      country,
      'country'
    );
    snapshotIds.push(snapshotId);
  }

  // Group by language
  const languages = await prisma.user.groupBy({
    by: ['language'],
    where: {
      isVerified: true,
      language: { not: null },
    },
    _count: true,
  });

  for (const { language } of languages) {
    if (!language) continue;

    const snapshotId = await generateRegionalLeaderboard(
      type,
      periodStart,
      periodEnd,
      language,
      'language'
    );
    snapshotIds.push(snapshotId);
  }

  console.log(`✅ Created ${snapshotIds.length} regional leaderboard snapshots`);
  return snapshotIds;
}

/**
 * Generate a single regional leaderboard
 */
async function generateRegionalLeaderboard(
  type: LeaderboardType,
  periodStart: Date,
  periodEnd: Date,
  region: string,
  regionType: 'country' | 'city' | 'language' | 'community'
): Promise<string> {
  const whereClause: any = {
    isVerified: true,
  };

  whereClause[regionType] = region;

  const users = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, totalEarnings: true },
  });

  const scores: Array<{
    userId: string;
    score: number;
    metadata: string;
  }> = [];

  for (const user of users) {
    try {
      const stats = await collectUserStats(user.id);
      const scoreBreakdown = computeLeaderboardScore(type, {
        ...stats,
        totalEarnings: user.totalEarnings,
      });

      scores.push({
        userId: user.id,
        score: scoreBreakdown.total,
        metadata: JSON.stringify(scoreBreakdown),
      });
    } catch (error) {
      console.error(`Failed to compute score for user ${user.id}:`, error);
    }
  }

  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 50); // Top 50 for regional

  const snapshot = await prisma.leaderboardSnapshot.create({
    data: {
      type,
      periodStart,
      periodEnd,
      region,
      regionType,
      entries: {
        create: topScores.map((s, index) => ({
          userId: s.userId,
          rankPosition: index + 1,
          score: s.score,
          metadata: s.metadata,
        })),
      },
    },
  });

  return snapshot.id;
}

/**
 * Generate weekly leaderboards
 */
export async function generateWeeklyLeaderboards(): Promise<void> {
  console.log('📅 Generating weekly leaderboards...');

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(now);
  weekEnd.setHours(23, 59, 59, 999);

  // Generate weekly top humans
  const users = await prisma.user.findMany({
    where: { isVerified: true },
    select: { id: true },
  });

  const scores: Array<{
    userId: string;
    score: number;
    metadata: string;
  }> = [];

  for (const user of users) {
    try {
      const stats = await collectWeeklyUserStats(user.id, weekStart, weekEnd);
      const scoreBreakdown = computeLeaderboardScore('WEEKLY_TOP_HUMANS', stats);

      // Only include users with activity this week
      if (scoreBreakdown.total > 0) {
        scores.push({
          userId: user.id,
          score: scoreBreakdown.total,
          metadata: JSON.stringify(scoreBreakdown),
        });
      }
    } catch (error) {
      console.error(`Failed to compute weekly score for user ${user.id}:`, error);
    }
  }

  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 100);

  await prisma.leaderboardSnapshot.create({
    data: {
      type: 'WEEKLY_TOP_HUMANS',
      periodStart: weekStart,
      periodEnd: weekEnd,
      entries: {
        create: topScores.map((s, index) => ({
          userId: s.userId,
          rankPosition: index + 1,
          score: s.score,
          metadata: s.metadata,
        })),
      },
    },
  });

  // Similarly for weekly top creators
  const creatorScores: Array<{
    userId: string;
    score: number;
    metadata: string;
  }> = [];

  for (const user of users) {
    try {
      const stats = await collectWeeklyUserStats(user.id, weekStart, weekEnd);
      const scoreBreakdown = computeLeaderboardScore('WEEKLY_TOP_CREATORS', stats);

      if (scoreBreakdown.total > 0) {
        creatorScores.push({
          userId: user.id,
          score: scoreBreakdown.total,
          metadata: JSON.stringify(scoreBreakdown),
        });
      }
    } catch (error) {
      console.error(`Failed to compute weekly creator score for user ${user.id}:`, error);
    }
  }

  creatorScores.sort((a, b) => b.score - a.score);
  const topCreators = creatorScores.slice(0, 100);

  await prisma.leaderboardSnapshot.create({
    data: {
      type: 'WEEKLY_TOP_CREATORS',
      periodStart: weekStart,
      periodEnd: weekEnd,
      entries: {
        create: topCreators.map((s, index) => ({
          userId: s.userId,
          rankPosition: index + 1,
          score: s.score,
          metadata: s.metadata,
        })),
      },
    },
  });

  console.log(`✅ Weekly leaderboards generated`);
}

/**
 * Main job to run all leaderboard generation
 * Run this weekly via cron
 */
export async function runLeaderboardUpdateJob(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Starting leaderboard update job...');

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Generate all global leaderboards
    await generateGlobalLeaderboard('GLOBAL_TOP_HUMANS', monthStart, monthEnd);
    await generateGlobalLeaderboard('GLOBAL_TOP_CREATORS', monthStart, monthEnd);
    await generateGlobalLeaderboard('GLOBAL_TOP_HELPERS', monthStart, monthEnd);
    await generateGlobalLeaderboard('GLOBAL_TOP_HONEST', monthStart, monthEnd);
    await generateGlobalLeaderboard('GLOBAL_TOP_VETERANS', monthStart, monthEnd);
    await generateGlobalLeaderboard('GLOBAL_TOP_EXPLORERS', monthStart, monthEnd);
    await generateGlobalLeaderboard('GLOBAL_TOP_EARNERS', monthStart, monthEnd);

    // Generate regional leaderboards
    await generateRegionalLeaderboards('REGIONAL_TOP_CREATORS', monthStart, monthEnd);

    // Generate weekly leaderboards
    await generateWeeklyLeaderboards();

    const duration = Date.now() - startTime;
    console.log(`✅ Leaderboard update complete in ${duration}ms`);
  } catch (error) {
    console.error('❌ Leaderboard update job failed:', error);
    throw error;
  }
}
