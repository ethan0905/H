import React from 'react';

interface SeasonOneBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function SeasonOneBadge({ 
  size = 'md', 
  showLabel = true,
  className = '' 
}: SeasonOneBadgeProps) {
  const sizeClasses = {
    sm: 'text-base px-2 py-1 text-xs',
    md: 'text-xl px-4 py-2 text-sm',
    lg: 'text-2xl px-5 py-3 text-base',
  };

  const iconSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 ${sizeClasses[size]} ${className}`}
      title="Season 1 OG Human"
    >
      <span className={iconSizeClasses[size]}>👑</span>
      {showLabel && (
        <span className={`font-semibold text-yellow-400 ${textSizeClasses[size]}`}>
          Season 1 OG Human
        </span>
      )}
    </div>
  );
}
