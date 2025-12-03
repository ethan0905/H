export interface User {
  id: string;
  worldcoinId?: string;
  walletAddress?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  profilePictureUrl?: string;
  isVerified?: boolean;
  verified?: boolean; // Alternative field name for compatibility
  isPro?: boolean; // Pro subscription status
  isSeasonOneOG?: boolean; // Season 1 OG Human badge
  isSuperAdmin?: boolean; // Super admin privileges
  createdAt?: Date;
  updatedAt?: Date;
  // World ID verification
  verificationLevel?: 'orb' | 'device';
  nullifierHash?: string;
  // Gamification fields
  currentRank?: string;
  rankScore?: number;
  country?: string;
  city?: string;
  language?: string;
}

export interface Tweet {
  id: string;
  content: string;
  author: User;
  likes: number;
  retweets: number;
  replies: number;
  isLiked?: boolean;
  isRetweeted?: boolean;
  createdAt: string;
  updatedAt?: string;
  media?: MediaItem[];
  comments?: Comment[];
  views?: number;
  earnings?: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
}

export interface CreateTweetData {
  content: string;
  media?: File[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface WorldIDVerification {
  verified: boolean;
  verification_level: 'orb' | 'device';
  nullifier_hash: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  tweetId: string;
  createdAt: string;
  updatedAt?: string;
}
