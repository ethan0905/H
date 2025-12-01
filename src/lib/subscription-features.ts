/**
 * Subscription Feature Gates
 * Defines limits and features for different subscription tiers
 */

export type SubscriptionTier = 'free' | 'pro'

export interface SubscriptionLimits {
  maxPostsPerDay: number
  maxCharactersPerPost: number
  withdrawalFeePercentage: number
  hasPrioritySupport: boolean
  hasAdvancedAnalytics: boolean
  hasEarlyAccess: boolean
  hasProBadge: boolean
  hasSeasonBadge: boolean
}

// Feature limits for each tier
export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxPostsPerDay: 10,
    maxCharactersPerPost: 280,
    withdrawalFeePercentage: 20,
    hasPrioritySupport: false,
    hasAdvancedAnalytics: false,
    hasEarlyAccess: false,
    hasProBadge: false,
    hasSeasonBadge: false,
  },
  pro: {
    maxPostsPerDay: -1, // unlimited
    maxCharactersPerPost: 1000,
    withdrawalFeePercentage: 5,
    hasPrioritySupport: true,
    hasAdvancedAnalytics: true,
    hasEarlyAccess: true,
    hasProBadge: true,
    hasSeasonBadge: true,
  },
}

/**
 * Get feature limits for a subscription tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return SUBSCRIPTION_FEATURES[tier]
}

/**
 * Check if user can post based on daily limit
 */
export function canUserPost(tier: SubscriptionTier, postsToday: number): boolean {
  const limits = SUBSCRIPTION_FEATURES[tier]
  if (limits.maxPostsPerDay === -1) return true // unlimited
  return postsToday < limits.maxPostsPerDay
}

/**
 * Check if post length is within character limit
 */
export function isPostLengthValid(tier: SubscriptionTier, postLength: number): boolean {
  const limits = SUBSCRIPTION_FEATURES[tier]
  return postLength <= limits.maxCharactersPerPost
}

/**
 * Get remaining posts for today
 */
export function getRemainingPosts(tier: SubscriptionTier, postsToday: number): number | string {
  const limits = SUBSCRIPTION_FEATURES[tier]
  if (limits.maxPostsPerDay === -1) return 'Unlimited'
  return Math.max(0, limits.maxPostsPerDay - postsToday)
}

/**
 * Calculate withdrawal fee
 */
export function calculateWithdrawalFee(tier: SubscriptionTier, amount: number): number {
  const limits = SUBSCRIPTION_FEATURES[tier]
  return amount * (limits.withdrawalFeePercentage / 100)
}

/**
 * Calculate net withdrawal amount after fees
 */
export function calculateNetWithdrawal(tier: SubscriptionTier, amount: number): number {
  const fee = calculateWithdrawalFee(tier, amount)
  return amount - fee
}

/**
 * Format character limit for display
 */
export function formatCharacterLimit(tier: SubscriptionTier): string {
  const limits = SUBSCRIPTION_FEATURES[tier]
  return `${limits.maxCharactersPerPost} characters`
}

/**
 * Format post limit for display
 */
export function formatPostLimit(tier: SubscriptionTier): string {
  const limits = SUBSCRIPTION_FEATURES[tier]
  if (limits.maxPostsPerDay === -1) return 'Unlimited posts'
  return `${limits.maxPostsPerDay} posts per day`
}

/**
 * Get upgrade benefits when moving from free to pro
 */
export function getUpgradeBenefits(): string[] {
  return [
    'Unlimited content publishing',
    '1000 characters per post',
    '5% withdrawal fees (75% savings)',
    'Season 1 Human Badge (unique & permanent)',
    'Priority support & advanced analytics',
    'Early access to new features',
  ]
}

/**
 * Calculate savings from Pro subscription
 */
export function calculateProSavings(withdrawalAmount: number): {
  freeFee: number
  proFee: number
  savings: number
  savingsPercentage: number
} {
  const freeFee = calculateWithdrawalFee('free', withdrawalAmount)
  const proFee = calculateWithdrawalFee('pro', withdrawalAmount)
  const savings = freeFee - proFee
  const savingsPercentage = ((savings / freeFee) * 100)

  return {
    freeFee,
    proFee,
    savings,
    savingsPercentage,
  }
}
