'use client';

import { User, WorldIDVerification } from '@/types';

interface VerifiedBadgeProps {
  user: User;
  worldIdVerification?: WorldIDVerification | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerifiedBadge({ 
  user, 
  worldIdVerification, 
  size = 'sm', 
  className = '' 
}: VerifiedBadgeProps) {
  // Determine verification status
  const isWorldIDVerified = worldIdVerification?.verified && worldIdVerification?.verification_level === 'orb';
  const isUserVerified = user.isVerified;

  const paddingClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
    lg: 'px-3 py-1.5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {isWorldIDVerified ? (
        <span 
          className={`${paddingClasses[size]} ${textSizeClasses[size]} font-medium rounded-full border-2`}
          style={{
            backgroundColor: 'rgba(39, 98, 234, 0.5)', // #2762EA with 50% opacity
            borderColor: '#5A8CFF',
            color: '#5A8CFF'
          }}
        >
          Verified Human
        </span>
      ) : isUserVerified ? (
        <span 
          className={`${paddingClasses[size]} ${textSizeClasses[size]} font-medium rounded-full border-2`}
          style={{
            backgroundColor: 'rgba(0, 255, 190, 0.5)', // Brand green with 50% opacity
            borderColor: '#00FFBE',
            color: '#00FFBE'
          }}
        >
          Verified
        </span>
      ) : (
        <span 
          className={`${paddingClasses[size]} ${textSizeClasses[size]} font-medium rounded-full border-2`}
          style={{
            backgroundColor: 'rgba(255, 132, 0, 0.5)', // #FF8400 with 50% opacity
            borderColor: '#FF8400',
            color: '#FF8400'
          }}
        >
          Non Verified
        </span>
      )}
    </div>
  );
}
