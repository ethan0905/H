'use client';

import { Flame, Award, TrendingUp } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  isActive = true,
  size = 'md',
  showDetails = false,
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      icon: 16,
      text: 'text-xs',
      number: 'text-sm',
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 20,
      text: 'text-sm',
      number: 'text-base',
    },
    lg: {
      container: 'px-4 py-2',
      icon: 24,
      text: 'text-base',
      number: 'text-lg',
    },
  };

  const classes = sizeClasses[size];

  // Determine streak color based on length
  const getStreakColor = () => {
    if (!isActive || currentStreak === 0) return 'text-gray-500';
    if (currentStreak >= 30) return 'text-purple-500'; // Purple for 30+ days
    if (currentStreak >= 14) return 'text-blue-500'; // Blue for 14+ days
    if (currentStreak >= 7) return 'text-green-500'; // Green for 7+ days
    return 'text-orange-500'; // Orange for 1-6 days
  };

  const getBgColor = () => {
    if (!isActive || currentStreak === 0) return 'bg-gray-900/50';
    if (currentStreak >= 30) return 'bg-purple-500/10';
    if (currentStreak >= 14) return 'bg-blue-500/10';
    if (currentStreak >= 7) return 'bg-green-500/10';
    return 'bg-orange-500/10';
  };

  const getBorderColor = () => {
    if (!isActive || currentStreak === 0) return 'border-gray-800';
    if (currentStreak >= 30) return 'border-purple-500/30';
    if (currentStreak >= 14) return 'border-blue-500/30';
    if (currentStreak >= 7) return 'border-green-500/30';
    return 'border-orange-500/30';
  };

  return (
    <div className="space-y-2">
      {/* Main Streak Display */}
      <div
        className={`inline-flex items-center gap-2 ${classes.container} ${getBgColor()} ${getBorderColor()} border rounded-full transition-all ${
          isActive && currentStreak > 0 ? 'hover:scale-105' : ''
        }`}
      >
        <Flame
          size={classes.icon}
          className={`${getStreakColor()} ${isActive && currentStreak > 0 ? 'animate-pulse' : ''}`}
          fill={isActive && currentStreak > 0 ? 'currentColor' : 'none'}
        />
        <div className="flex items-center gap-1">
          <span className={`font-bold ${classes.number} ${getStreakColor()}`}>
            {currentStreak}
          </span>
          <span className={`${classes.text} text-gray-400`}>
            {currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {longestStreak !== undefined && longestStreak > 0 && (
            <div className="flex items-center gap-1">
              <Award size={14} className="text-yellow-500" />
              <span>Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}</span>
            </div>
          )}
          {!isActive && currentStreak > 0 && (
            <div className="flex items-center gap-1 text-yellow-600">
              <TrendingUp size={14} />
              <span>Post today to continue!</span>
            </div>
          )}
        </div>
      )}

      {/* Milestone Messages */}
      {showDetails && isActive && (
        <>
          {currentStreak === 7 && (
            <div className="text-xs text-green-400 font-medium">
              🎉 One week streak! Keep it up!
            </div>
          )}
          {currentStreak === 14 && (
            <div className="text-xs text-blue-400 font-medium">
              🔥 Two week streak! You're on fire!
            </div>
          )}
          {currentStreak === 30 && (
            <div className="text-xs text-purple-400 font-medium">
              👑 One month streak! Legendary!
            </div>
          )}
          {currentStreak === 100 && (
            <div className="text-xs text-pink-400 font-medium">
              ⭐ 100 day streak! You're unstoppable!
            </div>
          )}
        </>
      )}
    </div>
  );
}
