/**
 * Leaderboard Scoring Service
 * 
 * Pure functions for computing leaderboard scores for different categories.
 * Each leaderboard type has its own scoring formula optimized for that metric.
 */

import { UserStats, LeaderboardScoreBreakdown } from '@/types/gamification';

/**
 * GLOBAL_TOP_HUMANS: Overall influence / composite score
 * Balanced across all activities
 */
export function computeGlobalTopHumansScore(stats: UserStats): LeaderboardScoreBreakdown {
  const breakdown: LeaderboardScoreBreakdown = {
    baseScore: 0,
    bonuses: [],
    total: 0,
  };

  // Base score from rank score equivalent
  breakdown.baseScore = 
    stats.totalTweets * 10 +
    stats.totalComments * 5 +
    stats.streakDays * 5 +
    stats.likesFromVerifiedHumans * 3 +
    stats.commentsFromVerifiedHumans * 8 +
    stats.successfulInvitesCount * 50;

  // Quality bonus
  if (stats.avgEngagementPerPost >= 5) {
    breakdown.bonuses.push({ reason: 'High engagement quality', value: stats.avgEngagementPerPost * 50 });
  }

  // Consistency bonus
  if (stats.streakDays >= 30) {
    breakdown.bonuses.push({ reason: 'Long streak bonus', value: stats.streakDays * 2 });
  }

  // Veteran bonus
  if (stats.daysSinceJoin >= 90) {
    breakdown.bonuses.push({ reason: 'Veteran user', value: 500 });
  }

  breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
  return breakdown;
}

/**
 * GLOBAL_TOP_CREATORS: Content quantity + quality
 * Heavily weighted towards content creation and engagement
 */
export function computeTopCreatorsScore(stats: UserStats): LeaderboardScoreBreakdown {
  const breakdown: LeaderboardScoreBreakdown = {
    baseScore: 0,
    bonuses: [],
    total: 0,
  };

  // Base score: content creation
  breakdown.baseScore = 
    stats.totalTweets * 50 +
    stats.totalComments * 20;

  // Quality multiplier
  const qualityMultiplier = Math.min(stats.avgEngagementPerPost / 2, 3); // Cap at 3x
  breakdown.bonuses.push({ 
    reason: 'Content quality multiplier', 
    value: breakdown.baseScore * (qualityMultiplier - 1) 
  });

  // Consistency bonus
  if (stats.streakDays >= 14) {
    breakdown.bonuses.push({ reason: 'Regular creator', value: 300 });
  }

  // Viral content bonus
  if (stats.avgEngagementPerPost >= 10) {
    breakdown.bonuses.push({ reason: 'Viral content creator', value: 1000 });
  }

  breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
  return breakdown;
}

/**
 * GLOBAL_TOP_HELPERS: Measured by helpful interactions
 * Focuses on comments and engagement with others' content
 */
export function computeTopHelpersScore(stats: UserStats): LeaderboardScoreBreakdown {
  const breakdown: LeaderboardScoreBreakdown = {
    baseScore: 0,
    bonuses: [],
    total: 0,
  };

  // Base score: helping activities
  breakdown.baseScore = 
    stats.totalComments * 100 +
    stats.commentsFromVerifiedHumans * 50; // Comments that generate replies

  // Helpfulness ratio bonus
  const helpfulnessRatio = stats.totalComments / Math.max(stats.totalTweets, 1);
  if (helpfulnessRatio >= 2) {
    breakdown.bonuses.push({ 
      reason: 'High helpfulness ratio', 
      value: helpfulnessRatio * 200 
    });
  }

  // Community engagement bonus
  if (stats.commentsFromVerifiedHumans >= 50) {
    breakdown.bonuses.push({ reason: 'Strong community engagement', value: 500 });
  }

  breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
  return breakdown;
}

/**
 * GLOBAL_TOP_HONEST: Trust / reputation score
 * Based on votes from other humans (would need additional data)
 */
export function computeTopHonestScore(stats: UserStats): LeaderboardScoreBreakdown {
  const breakdown: LeaderboardScoreBreakdown = {
    baseScore: 0,
    bonuses: [],
    total: 0,
  };

  // Base score from human interactions (proxy for trust)
  breakdown.baseScore = 
    stats.likesFromVerifiedHumans * 10 +
    stats.commentsFromVerifiedHumans * 20 +
    (stats.infinityVotesCount || 0) * 1000; // Votes are strong trust indicators

  // Long-term consistency bonus
  if (stats.streakDays >= 60) {
    breakdown.bonuses.push({ reason: 'Consistent presence', value: 500 });
  }

  // Veteran trust bonus
  if (stats.daysSinceJoin >= 180) {
    breakdown.bonuses.push({ reason: 'Long-term member', value: 800 });
  }

  breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
  return breakdown;
}

/**
 * GLOBAL_TOP_VETERANS: Longevity + streak consistency
 * Rewards long-term engagement and daily activity
 */
export function computeTopVeteransScore(stats: UserStats): LeaderboardScoreBreakdown {
  const breakdown: LeaderboardScoreBreakdown = {
    baseScore: 0,
    bonuses: [],
    total: 0,
  };

  // Base score: longevity
  breakdown.baseScore = 
    stats.daysSinceJoin * 10 +
    stats.streakDays * 20;

  // Long streak bonus (exponential)
  if (stats.streakDays >= 30) {
    breakdown.bonuses.push({ 
      reason: 'Long streak achievement', 
      value: Math.pow(stats.streakDays / 30, 1.5) * 500 
    });
  }

  // Ancient user bonus
  if (stats.daysSinceJoin >= 365) {
    breakdown.bonuses.push({ reason: 'Year+ veteran', value: 2000 });
  }

  // Consistency bonus
  const consistencyRatio = stats.streakDays / Math.max(stats.daysSinceJoin, 1);
  if (consistencyRatio >= 0.5) {
    breakdown.bonuses.push({ 
      reason: 'High consistency', 
      value: consistencyRatio * 1000 
    });
  }

  breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
  return breakdown;
}

/**
 * GLOBAL_TOP_EXPLORERS: Network growth / invitations
 * Rewards successful user invitations
 */
export function computeTopExplorersScore(stats: UserStats): LeaderboardScoreBreakdown {
  const breakdown: LeaderboardScoreBreakdown = {
    baseScore: 0,
    bonuses: [],
    total: 0,
  };

  // Base score: successful invites
  breakdown.baseScore = stats.successfulInvitesCount * 1000;

  // Conversion rate bonus
  if (stats.invitesCount > 0) {
    const conversionRate = stats.successfulInvitesCount / stats.invitesCount;
    if (conversionRate >= 0.5) {
      breakdown.bonuses.push({ 
        reason: 'High conversion rate', 
        value: conversionRate * 500 
      });
    }
  }

  // Volume bonus
  if (stats.successfulInvitesCount >= 10) {
    breakdown.bonuses.push({ reason: 'Ambassador status', value: 2000 });
  }

  if (stats.successfulInvitesCount >= 50) {
    breakdown.bonuses.push({ reason: 'Elite recruiter', value: 5000 });
  }

  breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
  return breakdown;
}

/**
 * GLOBAL_TOP_EARNERS: Money earned via platform
 * Direct score from totalEarnings
 */
export function computeTopEarnersScore(stats: UserStats & { totalEarnings: number }): LeaderboardScoreBreakdown {
  const breakdown: LeaderboardScoreBreakdown = {
    baseScore: 0,
    bonuses: [],
    total: 0,
  };

  // Base score: earnings (1 point per dollar/unit)
  breakdown.baseScore = stats.totalEarnings;

  // High earner milestones
  if (stats.totalEarnings >= 1000) {
    breakdown.bonuses.push({ reason: '$1K+ earned', value: 500 });
  }

  if (stats.totalEarnings >= 10000) {
    breakdown.bonuses.push({ reason: '$10K+ earned', value: 2000 });
  }

  breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
  return breakdown;
}

/**
 * WEEKLY leaderboards: Use time-bounded stats
 * Same scoring functions but only count activity from the current week
 */
export function computeWeeklyScore(
  stats: UserStats,
  type: 'TOP_HUMANS' | 'TOP_CREATORS'
): LeaderboardScoreBreakdown {
  // For weekly, we use the same formulas but with reduced bonuses
  // since long-term metrics like daysSinceJoin are less relevant
  
  if (type === 'TOP_HUMANS') {
    const breakdown = computeGlobalTopHumansScore(stats);
    // Remove veteran bonuses for weekly
    breakdown.bonuses = breakdown.bonuses.filter(b => 
      !b.reason.includes('Veteran') && !b.reason.includes('veteran')
    );
    breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
    return breakdown;
  } else {
    const breakdown = computeTopCreatorsScore(stats);
    // Keep quality multipliers but remove long-term bonuses
    breakdown.bonuses = breakdown.bonuses.filter(b => 
      b.reason.includes('quality') || b.reason.includes('Viral')
    );
    breakdown.total = breakdown.baseScore + breakdown.bonuses.reduce((sum, b) => sum + b.value, 0);
    return breakdown;
  }
}

/**
 * Helper: Compute score for any leaderboard type
 */
export function computeLeaderboardScore(
  type: string,
  stats: UserStats & { totalEarnings?: number }
): LeaderboardScoreBreakdown {
  switch (type) {
    case 'GLOBAL_TOP_HUMANS':
      return computeGlobalTopHumansScore(stats);
    case 'GLOBAL_TOP_CREATORS':
    case 'REGIONAL_TOP_CREATORS':
      return computeTopCreatorsScore(stats);
    case 'GLOBAL_TOP_HELPERS':
      return computeTopHelpersScore(stats);
    case 'GLOBAL_TOP_HONEST':
      return computeTopHonestScore(stats);
    case 'GLOBAL_TOP_VETERANS':
      return computeTopVeteransScore(stats);
    case 'GLOBAL_TOP_EXPLORERS':
      return computeTopExplorersScore(stats);
    case 'GLOBAL_TOP_EARNERS':
      return computeTopEarnersScore(stats as UserStats & { totalEarnings: number });
    case 'WEEKLY_TOP_HUMANS':
      return computeWeeklyScore(stats, 'TOP_HUMANS');
    case 'WEEKLY_TOP_CREATORS':
      return computeWeeklyScore(stats, 'TOP_CREATORS');
    default:
      return { baseScore: 0, bonuses: [], total: 0 };
  }
}
