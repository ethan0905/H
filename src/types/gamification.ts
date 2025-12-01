// Gamification Types

export type HumanRank =
  | 'HUMAN_VERIFIED'      // Level 0 - Just verified
  | 'HUMAN_EXPLORER'      // Level 1
  | 'HUMAN_PIONEER'       // Level 2
  | 'HUMAN_ELITE'         // Level 3
  | 'HUMAN_LEGEND'        // Level 4
  | 'HUMAN_INFINITY';     // Level 5 - Voted by community

export interface UserStats {
  userId: string;
  streakDays: number;
  lastActiveAt: Date | null;
  totalTweets: number;
  totalComments: number;
  totalLikes: number;
  totalRetweets: number;
  likesFromVerifiedHumans: number;
  commentsFromVerifiedHumans: number;
  avgEngagementPerPost: number;
  invitesCount: number;
  successfulInvitesCount: number;
  daysSinceJoin: number;
  infinityVotesCount?: number;
}

export interface RankResult {
  rank: HumanRank;
  rankScore: number;
  progressToNext: number; // 0-1, percentage to next rank
  nextRank: HumanRank | null;
  requirements: {
    met: string[];
    pending: string[];
  };
}

export interface TagGrant {
  tagId: string;
  userId: string;
  reason?: string;
}

export type LeaderboardType =
  | 'GLOBAL_TOP_HUMANS'
  | 'GLOBAL_TOP_CREATORS'
  | 'GLOBAL_TOP_HELPERS'
  | 'GLOBAL_TOP_HONEST'
  | 'GLOBAL_TOP_VETERANS'
  | 'GLOBAL_TOP_EXPLORERS'
  | 'GLOBAL_TOP_EARNERS'
  | 'REGIONAL_TOP_CREATORS'
  | 'REGIONAL_TOP_HUMANS'
  | 'WEEKLY_TOP_HUMANS'
  | 'WEEKLY_TOP_CREATORS';

export type RegionType = 'country' | 'city' | 'language' | 'community';

export interface LeaderboardScoreBreakdown {
  baseScore: number;
  bonuses: { reason: string; value: number }[];
  penalties?: { reason: string; value: number }[];
  total: number;
}

export interface LeaderboardFilters {
  type: LeaderboardType;
  region?: string;
  regionType?: RegionType;
  periodStart?: Date;
  periodEnd?: Date;
  limit?: number;
}

export interface SeasonConfig {
  name: string;
  theme: string;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
}

export interface TagConfig {
  name: string;
  description?: string;
  seasonId?: string;
  isLimited: boolean;
  maxSupply?: number;
  metadata?: Record<string, any>;
}

export interface UserRankDisplay {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  currentRank: HumanRank;
  rankScore: number;
  progressToNext: number;
  tags: Array<{
    id: string;
    name: string;
    isLimited: boolean;
    seasonName?: string;
  }>;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  currentRank: HumanRank;
  rankPosition: number;
  score: number;
  scoreBreakdown?: LeaderboardScoreBreakdown;
  isVerified?: boolean;
  tags?: Array<{
    id: string;
    name: string;
    isLimited: boolean;
  }>;
}
