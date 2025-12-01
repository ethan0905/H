'use client';

import { HumanRank } from '@/types/gamification';
import { getRankDisplayName, getRankColor, getRankIcon } from '@/lib/gamification/rankService';

interface RankBadgeProps {
  rank: HumanRank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RankBadge({ rank, size = 'md', showLabel = false, className = '' }: RankBadgeProps) {
  const color = getRankColor(rank);
  const icon = getRankIcon(rank);
  const label = getRankDisplayName(rank);

  const sizes = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-bold border-2 transition-all hover:scale-110`}
        style={{
          backgroundColor: color + '20',
          borderColor: color,
          color: color,
        }}
        title={label}
      >
        {icon}
      </div>
      {showLabel && (
        <span
          className={`${textSizes[size]} font-semibold`}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
