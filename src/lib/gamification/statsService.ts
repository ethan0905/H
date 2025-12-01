/**
 * User Stats Service
 * 
 * Collects and computes user statistics from the database.
 * Used by rank computation and leaderboard scoring.
 */

import { prisma } from '@/lib/prisma';
import { UserStats } from '@/types/gamification';

/**
 * Collect comprehensive stats for a user
 * This is used for rank computation and leaderboard scoring
 */
export async function collectUserStats(userId: string): Promise<UserStats> {
  // Get user basic info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      lastActiveAt: true,
      invitesCount: true,
      successfulInvitesCount: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Count tweets
  const totalTweets = await prisma.tweet.count({
    where: { authorId: userId },
  });

  // Count comments
  const totalComments = await prisma.comment.count({
    where: { authorId: userId },
  });

  // Count likes received
  const totalLikes = await prisma.like.count({
    where: {
      tweet: {
        authorId: userId,
      },
    },
  });

  // Count retweets received
  const totalRetweets = await prisma.retweet.count({
    where: {
      tweet: {
        authorId: userId,
      },
    },
  });

  // Count likes from verified humans (users with isVerified = true)
  const likesFromVerifiedHumans = await prisma.like.count({
    where: {
      tweet: {
        authorId: userId,
      },
      user: {
        isVerified: true,
      },
    },
  });

  // Count comments from verified humans
  const commentsFromVerifiedHumans = await prisma.comment.count({
    where: {
      tweet: {
        authorId: userId,
      },
      author: {
        isVerified: true,
      },
    },
  });

  // Calculate average engagement per post
  const totalEngagement = totalLikes + totalRetweets + totalComments;
  const avgEngagementPerPost = totalTweets > 0 ? totalEngagement / totalTweets : 0;

  // Calculate days since join
  const daysSinceJoin = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get infinity votes count
  const infinityVotesCount = await prisma.humanInfinityVote.count({
    where: {
      candidateId: userId,
      voter: {
        OR: [
          { currentRank: 'HUMAN_LEGEND' },
          { currentRank: 'HUMAN_INFINITY' },
        ],
      },
    },
  });

  return {
    userId,
    streakDays: user.streakDays,
    lastActiveAt: user.lastActiveAt,
    totalTweets,
    totalComments,
    totalLikes,
    totalRetweets,
    likesFromVerifiedHumans,
    commentsFromVerifiedHumans,
    avgEngagementPerPost,
    invitesCount: user.invitesCount,
    successfulInvitesCount: user.successfulInvitesCount,
    daysSinceJoin,
    infinityVotesCount,
  };
}

/**
 * Collect stats for multiple users efficiently
 * Used for batch rank updates and leaderboard generation
 */
export async function collectMultipleUserStats(
  userIds: string[]
): Promise<Map<string, UserStats>> {
  const statsMap = new Map<string, UserStats>();

  // Use Promise.all for parallel fetching
  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const stats = await collectUserStats(userId);
        statsMap.set(userId, stats);
      } catch (error) {
        console.error(`Failed to collect stats for user ${userId}:`, error);
      }
    })
  );

  return statsMap;
}

/**
 * Collect weekly stats for a user (for weekly leaderboards)
 * Only counts activity from the last 7 days
 */
export async function collectWeeklyUserStats(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<UserStats> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      lastActiveAt: true,
      invitesCount: true,
      successfulInvitesCount: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Count tweets in the week
  const totalTweets = await prisma.tweet.count({
    where: {
      authorId: userId,
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Count comments in the week
  const totalComments = await prisma.comment.count({
    where: {
      authorId: userId,
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Count likes received in the week
  const totalLikes = await prisma.like.count({
    where: {
      tweet: {
        authorId: userId,
      },
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Count retweets received in the week
  const totalRetweets = await prisma.retweet.count({
    where: {
      tweet: {
        authorId: userId,
      },
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Likes from verified humans in the week
  const likesFromVerifiedHumans = await prisma.like.count({
    where: {
      tweet: {
        authorId: userId,
      },
      user: {
        isVerified: true,
      },
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Comments from verified humans in the week
  const commentsFromVerifiedHumans = await prisma.comment.count({
    where: {
      tweet: {
        authorId: userId,
      },
      author: {
        isVerified: true,
      },
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  const totalEngagement = totalLikes + totalRetweets + totalComments;
  const avgEngagementPerPost = totalTweets > 0 ? totalEngagement / totalTweets : 0;

  const daysSinceJoin = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    userId,
    streakDays: user.streakDays,
    lastActiveAt: user.lastActiveAt,
    totalTweets,
    totalComments,
    totalLikes,
    totalRetweets,
    likesFromVerifiedHumans,
    commentsFromVerifiedHumans,
    avgEngagementPerPost,
    invitesCount: user.invitesCount,
    successfulInvitesCount: user.successfulInvitesCount,
    daysSinceJoin,
  };
}

/**
 * Update user streak based on last activity
 * Call this when user performs any action
 */
export async function updateUserStreak(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastActiveAt: true,
      streakDays: true,
    },
  });

  if (!user) return;

  const now = new Date();
  const lastActive = user.lastActiveAt;

  let newStreakDays = user.streakDays;

  if (!lastActive) {
    // First activity
    newStreakDays = 1;
  } else {
    const daysSinceLastActive = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActive === 0) {
      // Same day, no change
      return;
    } else if (daysSinceLastActive === 1) {
      // Consecutive day, increment streak
      newStreakDays = user.streakDays + 1;
    } else {
      // Streak broken, reset to 1
      newStreakDays = 1;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastActiveAt: now,
      streakDays: newStreakDays,
    },
  });
}
