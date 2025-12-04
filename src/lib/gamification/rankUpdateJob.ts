/**
 * Rank Update Job
 * 
 * Scheduled job to recalculate ranks for all active users.
 * Should run daily (e.g., via cron, Vercel Cron, or serverless function).
 */

import { prisma } from '@/lib/prisma';
import { collectUserStats, collectMultipleUserStats } from './statsService';
import { computeRankForUser, qualifiesForInfinity } from './rankService';

/**
 * Update ranks for all active users
 * Runs as a batch job
 */
export async function updateAllUserRanks(): Promise<{
  updated: number;
  failed: number;
  infinityUpgrades: number;
}> {
  console.log('🏅 Starting daily rank update job...');

  const startTime = Date.now();
  let updated = 0;
  let failed = 0;
  let infinityUpgrades = 0;

  try {
    // Get all users who have been active in the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activeUsers = await prisma.user.findMany({
      where: {
        OR: [
          { lastActiveAt: { gte: ninetyDaysAgo } },
          { createdAt: { gte: ninetyDaysAgo } },
        ],
      },
      select: { id: true },
    });

    console.log(`Found ${activeUsers.length} active users to process`);

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize);
      const userIds = batch.map((u) => u.id);

      try {
        // Collect stats for batch
        const statsMap = await collectMultipleUserStats(userIds);

        // Prepare batch update
        const updates: Array<{
          id: string;
          currentRank: string;
          rankScore: number;
        }> = [];

        for (const [userId, stats] of Array.from(statsMap.entries())) {
          try {
            // Compute new rank
            const rankResult = computeRankForUser(stats);

            // Check for Human Infinity upgrade
            let finalRank = rankResult.rank;
            if (qualifiesForInfinity(
              rankResult.rank,
              rankResult.rankScore,
              stats.infinityVotesCount || 0
            )) {
              finalRank = 'HUMAN_INFINITY';
              infinityUpgrades++;
              console.log(`🎉 User ${userId} upgraded to HUMAN_INFINITY!`);
            }

            updates.push({
              id: userId,
              currentRank: finalRank,
              rankScore: rankResult.rankScore,
            });

            updated++;
          } catch (error) {
            console.error(`Failed to compute rank for user ${userId}:`, error);
            failed++;
          }
        }

        // Batch update to database
        if (updates.length > 0) {
          await Promise.all(
            updates.map((update) =>
              prisma.user.update({
                where: { id: update.id },
                data: {
                  currentRank: update.currentRank,
                  rankScore: update.rankScore,
                },
              })
            )
          );
        }

        console.log(`Processed batch ${i / batchSize + 1}: ${updates.length} users updated`);
      } catch (error) {
        console.error(`Failed to process batch ${i / batchSize + 1}:`, error);
        failed += batch.length;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Rank update complete in ${duration}ms`);
    console.log(`Updated: ${updated}, Failed: ${failed}, Infinity Upgrades: ${infinityUpgrades}`);

    return { updated, failed, infinityUpgrades };
  } catch (error) {
    console.error('❌ Rank update job failed:', error);
    throw error;
  }
}

/**
 * Update rank for a single user (for immediate updates)
 * Call this when a user performs significant actions
 */
export async function updateUserRank(userId: string): Promise<void> {
  try {
    const stats = await collectUserStats(userId);
    const rankResult = computeRankForUser(stats);

    // Check for Human Infinity upgrade
    let finalRank = rankResult.rank;
    if (qualifiesForInfinity(
      rankResult.rank,
      rankResult.rankScore,
      stats.infinityVotesCount || 0
    )) {
      finalRank = 'HUMAN_INFINITY';
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentRank: finalRank,
        rankScore: rankResult.rankScore,
      },
    });

    console.log(`Updated rank for user ${userId}: ${finalRank} (${rankResult.rankScore} points)`);
  } catch (error) {
    console.error(`Failed to update rank for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get users eligible for Human Infinity promotion
 */
export async function getInfinityEligibleUsers(): Promise<string[]> {
  const legendUsers = await prisma.user.findMany({
    where: {
      currentRank: 'HUMAN_LEGEND',
      rankScore: { gte: 10000 },
    },
    select: { id: true },
  });

  const eligible: string[] = [];

  for (const user of legendUsers) {
    const votesCount = await prisma.humanInfinityVote.count({
      where: {
        candidateId: user.id,
        voter: {
          OR: [
            { currentRank: 'HUMAN_LEGEND' },
            { currentRank: 'HUMAN_INFINITY' },
          ],
        },
      },
    });

    if (votesCount >= 10) {
      eligible.push(user.id);
    }
  }

  return eligible;
}
