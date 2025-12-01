/**
 * Rank Computation Service
 * 
 * Pure functions for computing user ranks based on their stats.
 * This service implements the progression criteria:
 * - Constancy (streak / daily activity)
 * - Contribution (posts, comments, participation)
 * - Content quality (average engagement per post)
 * - Impact (likes from humans, comments from humans)
 * - Invitations (successful invites)
 */

import { HumanRank, UserStats, RankResult } from '@/types/gamification';

// Rank thresholds - tuned for balanced progression
const RANK_THRESHOLDS = {
  HUMAN_VERIFIED: 0,       // Starting rank
  HUMAN_EXPLORER: 100,     // Easy to reach - encourages early engagement
  HUMAN_PIONEER: 500,      // Moderate effort - consistent activity
  HUMAN_ELITE: 2000,       // Significant achievement
  HUMAN_LEGEND: 5000,      // Rare, high achievers
  HUMAN_INFINITY: 10000,   // Only via community votes, not auto-assigned
};

// Scoring weights for different criteria
const SCORING_WEIGHTS = {
  // Constancy: Daily activity and streaks
  streakDays: 5,           // 5 points per day of streak
  streakBonus: 2,          // Bonus multiplier for long streaks (>30 days)
  
  // Contribution: Content creation
  tweets: 10,              // 10 points per tweet
  comments: 5,             // 5 points per comment
  
  // Quality: Engagement metrics
  avgEngagement: 20,       // 20 points per avg engagement point
  
  // Impact: Human-to-human interactions
  likesFromHumans: 3,      // 3 points per like from verified human
  commentsFromHumans: 8,   // 8 points per comment from verified human
  
  // Invitations: Network growth
  invites: 50,             // 50 points per successful invite
  
  // Longevity: Time on platform
  veteranBonus: 1,         // 1 point per day since join
};

/**
 * Compute the rank and score for a user based on their stats
 * This is a pure function - no side effects, easy to test
 */
export function computeRankForUser(stats: UserStats): RankResult {
  // Calculate base score from all criteria
  let score = 0;
  
  // 1. Constancy score
  score += stats.streakDays * SCORING_WEIGHTS.streakDays;
  if (stats.streakDays >= 30) {
    score += stats.streakDays * SCORING_WEIGHTS.streakBonus; // Bonus for long streaks
  }
  
  // 2. Contribution score
  score += stats.totalTweets * SCORING_WEIGHTS.tweets;
  score += stats.totalComments * SCORING_WEIGHTS.comments;
  
  // 3. Quality score (engagement)
  score += stats.avgEngagementPerPost * SCORING_WEIGHTS.avgEngagement;
  
  // 4. Impact score (human interactions)
  score += stats.likesFromVerifiedHumans * SCORING_WEIGHTS.likesFromHumans;
  score += stats.commentsFromVerifiedHumans * SCORING_WEIGHTS.commentsFromHumans;
  
  // 5. Network growth score
  score += stats.successfulInvitesCount * SCORING_WEIGHTS.invites;
  
  // 6. Veteran bonus
  score += stats.daysSinceJoin * SCORING_WEIGHTS.veteranBonus;
  
  // Round to nearest integer
  const rankScore = Math.round(score);
  
  // Determine rank based on score (excluding HUMAN_INFINITY which is vote-based)
  let currentRank: HumanRank = 'HUMAN_VERIFIED';
  let nextRank: HumanRank | null = 'HUMAN_EXPLORER';
  
  if (rankScore >= RANK_THRESHOLDS.HUMAN_LEGEND) {
    currentRank = 'HUMAN_LEGEND';
    nextRank = 'HUMAN_INFINITY';
  } else if (rankScore >= RANK_THRESHOLDS.HUMAN_ELITE) {
    currentRank = 'HUMAN_ELITE';
    nextRank = 'HUMAN_LEGEND';
  } else if (rankScore >= RANK_THRESHOLDS.HUMAN_PIONEER) {
    currentRank = 'HUMAN_PIONEER';
    nextRank = 'HUMAN_ELITE';
  } else if (rankScore >= RANK_THRESHOLDS.HUMAN_EXPLORER) {
    currentRank = 'HUMAN_EXPLORER';
    nextRank = 'HUMAN_PIONEER';
  }
  
  // Calculate progress to next rank (0-1)
  let progressToNext = 0;
  if (nextRank && nextRank !== 'HUMAN_INFINITY') {
    const currentThreshold = RANK_THRESHOLDS[currentRank];
    const nextThreshold = RANK_THRESHOLDS[nextRank];
    progressToNext = Math.min(
      (rankScore - currentThreshold) / (nextThreshold - currentThreshold),
      1
    );
  }
  
  // Build requirements feedback
  const requirements = analyzeRequirements(stats, currentRank, nextRank);
  
  return {
    rank: currentRank,
    rankScore,
    progressToNext,
    nextRank,
    requirements,
  };
}

/**
 * Analyze which requirements are met vs pending for rank progression
 */
function analyzeRequirements(
  stats: UserStats,
  currentRank: HumanRank,
  nextRank: HumanRank | null
): { met: string[]; pending: string[] } {
  const met: string[] = [];
  const pending: string[] = [];
  
  // Streak requirements
  if (stats.streakDays >= 7) {
    met.push(`7+ day streak (${stats.streakDays} days)`);
  } else {
    pending.push(`Maintain a 7-day streak (current: ${stats.streakDays} days)`);
  }
  
  // Content requirements
  if (stats.totalTweets >= 10) {
    met.push(`10+ posts (${stats.totalTweets} posts)`);
  } else {
    pending.push(`Create 10+ posts (current: ${stats.totalTweets})`);
  }
  
  // Engagement requirements
  if (stats.avgEngagementPerPost >= 2) {
    met.push(`Quality content (${stats.avgEngagementPerPost.toFixed(1)} avg engagement)`);
  } else {
    pending.push(`Improve engagement (current: ${stats.avgEngagementPerPost.toFixed(1)} avg)`);
  }
  
  // Human interaction requirements
  if (stats.likesFromVerifiedHumans >= 10) {
    met.push(`10+ likes from humans (${stats.likesFromVerifiedHumans})`);
  } else {
    pending.push(`Get 10+ likes from verified humans (current: ${stats.likesFromVerifiedHumans})`);
  }
  
  // Invitation requirements (for higher ranks)
  if (currentRank === 'HUMAN_PIONEER' || currentRank === 'HUMAN_ELITE' || currentRank === 'HUMAN_LEGEND') {
    if (stats.successfulInvitesCount >= 3) {
      met.push(`Invited ${stats.successfulInvitesCount} humans`);
    } else {
      pending.push(`Invite 3+ humans to join (current: ${stats.successfulInvitesCount})`);
    }
  }
  
  return { met, pending };
}

/**
 * Check if a user qualifies for Human Infinity based on votes
 * Requires: 
 * - Already at HUMAN_LEGEND rank
 * - At least 10 votes from different HUMAN_LEGEND or HUMAN_INFINITY users
 * - Score threshold met
 */
export function qualifiesForInfinity(
  currentRank: HumanRank,
  rankScore: number,
  infinityVotesCount: number
): boolean {
  return (
    currentRank === 'HUMAN_LEGEND' &&
    rankScore >= RANK_THRESHOLDS.HUMAN_INFINITY &&
    infinityVotesCount >= 10
  );
}

/**
 * Get rank display name for UI
 */
export function getRankDisplayName(rank: HumanRank): string {
  const names: Record<HumanRank, string> = {
    HUMAN_VERIFIED: 'Human Verified',
    HUMAN_EXPLORER: 'Human Explorer',
    HUMAN_PIONEER: 'Human Pioneer',
    HUMAN_ELITE: 'Human Elite',
    HUMAN_LEGEND: 'Human Legend',
    HUMAN_INFINITY: 'Human Infinity',
  };
  return names[rank];
}

/**
 * Get rank level (0-5) for comparison
 */
export function getRankLevel(rank: HumanRank): number {
  const levels: Record<HumanRank, number> = {
    HUMAN_VERIFIED: 0,
    HUMAN_EXPLORER: 1,
    HUMAN_PIONEER: 2,
    HUMAN_ELITE: 3,
    HUMAN_LEGEND: 4,
    HUMAN_INFINITY: 5,
  };
  return levels[rank];
}

/**
 * Get rank color for UI
 */
export function getRankColor(rank: HumanRank): string {
  const colors: Record<HumanRank, string> = {
    HUMAN_VERIFIED: '#00FFBE',      // Brand green
    HUMAN_EXPLORER: '#00D9FF',      // Cyan
    HUMAN_PIONEER: '#6366F1',       // Indigo
    HUMAN_ELITE: '#A855F7',         // Purple
    HUMAN_LEGEND: '#F59E0B',        // Amber/Gold
    HUMAN_INFINITY: '#EC4899',      // Pink/Magenta (ultra rare)
  };
  return colors[rank];
}

/**
 * Get rank icon/emoji for UI
 */
export function getRankIcon(rank: HumanRank): string {
  const icons: Record<HumanRank, string> = {
    HUMAN_VERIFIED: '✓',
    HUMAN_EXPLORER: '🌍',
    HUMAN_PIONEER: '🚀',
    HUMAN_ELITE: '👑',
    HUMAN_LEGEND: '⭐',
    HUMAN_INFINITY: '∞',
  };
  return icons[rank];
}
