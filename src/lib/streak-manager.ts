/**
 * Streak Management Utility
 * Handles user streak tracking and updates
 */

import { prisma } from '@/lib/prisma';

/**
 * Check if two dates are on consecutive days
 */
function isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
  const lastDay = new Date(lastDate);
  lastDay.setHours(0, 0, 0, 0);
  
  const currentDay = new Date(currentDate);
  currentDay.setHours(0, 0, 0, 0);
  
  const diffTime = currentDay.getTime() - lastDay.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays === 1;
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  const day1 = new Date(date1);
  day1.setHours(0, 0, 0, 0);
  
  const day2 = new Date(date2);
  day2.setHours(0, 0, 0, 0);
  
  return day1.getTime() === day2.getTime();
}

/**
 * Check if more than 24 hours have passed since last post
 */
function isStreakBroken(lastDate: Date, currentDate: Date): boolean {
  const lastDay = new Date(lastDate);
  lastDay.setHours(0, 0, 0, 0);
  
  const currentDay = new Date(currentDate);
  currentDay.setHours(0, 0, 0, 0);
  
  const diffTime = currentDay.getTime() - lastDay.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays > 1;
}

/**
 * Update user streak when they post
 */
export async function updateUserStreak(userId: string): Promise<{
  streakDays: number;
  longestStreak: number;
  streakIncreased: boolean;
  streakReset: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      lastStreakDate: true,
      longestStreak: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  let newStreakDays = user.streakDays;
  let newLongestStreak = user.longestStreak;
  let streakIncreased = false;
  let streakReset = false;

  if (!user.lastStreakDate) {
    // First time posting - start streak at 1
    newStreakDays = 1;
    streakIncreased = true;
  } else if (isSameDay(user.lastStreakDate, now)) {
    // Already posted today - no change to streak
    newStreakDays = user.streakDays;
  } else if (isConsecutiveDay(user.lastStreakDate, now)) {
    // Posted on consecutive day - increment streak
    newStreakDays = user.streakDays + 1;
    streakIncreased = true;
  } else if (isStreakBroken(user.lastStreakDate, now)) {
    // Streak broken - reset to 1
    newStreakDays = 1;
    streakReset = true;
  }

  // Update longest streak if current is higher
  if (newStreakDays > newLongestStreak) {
    newLongestStreak = newStreakDays;
  }

  // Update user in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      streakDays: newStreakDays,
      lastStreakDate: now,
      longestStreak: newLongestStreak,
      lastActiveAt: now,
    },
  });

  return {
    streakDays: newStreakDays,
    longestStreak: newLongestStreak,
    streakIncreased,
    streakReset,
  };
}

/**
 * Get user's current streak status
 */
export async function getUserStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastPostDate: Date | null;
  isActive: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      lastStreakDate: true,
      longestStreak: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  let isActive = false;
  let currentStreak = user.streakDays;

  // Check if streak is still active
  if (user.lastStreakDate) {
    if (isSameDay(user.lastStreakDate, now)) {
      // Posted today - streak is active
      isActive = true;
    } else if (isConsecutiveDay(user.lastStreakDate, now)) {
      // Last post was yesterday - streak is at risk but still active
      isActive = true;
    } else if (isStreakBroken(user.lastStreakDate, now)) {
      // Streak is broken - should be reset on next post
      currentStreak = 0;
      isActive = false;
    }
  }

  return {
    currentStreak,
    longestStreak: user.longestStreak,
    lastPostDate: user.lastStreakDate,
    isActive,
  };
}

/**
 * Check and reset streaks for users who haven't posted in >24h
 * This should be run as a scheduled job
 */
export async function checkAndResetInactiveStreaks(): Promise<number> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  // Find users whose last post was more than 1 day ago and have an active streak
  const inactiveUsers = await prisma.user.findMany({
    where: {
      streakDays: { gt: 0 },
      lastStreakDate: { lt: yesterday },
    },
    select: { id: true },
  });

  // Reset their streaks
  if (inactiveUsers.length > 0) {
    await prisma.user.updateMany({
      where: {
        id: { in: inactiveUsers.map(u => u.id) },
      },
      data: {
        streakDays: 0,
      },
    });
  }

  return inactiveUsers.length;
}
