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
  
  // Don't show badge if not verified
  if (!isWorldIDVerified && !isUserVerified) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      {isWorldIDVerified ? (
        <>
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full flex items-center justify-center`}>
            <span className="text-white font-bold">◉</span>
          </div>
          <span className={`${textSizeClasses[size]} text-blue-600 font-medium`}>
            Verified Human
          </span>
        </>
      ) : isUserVerified ? (
        <>
          <div className={`${sizeClasses[size]} bg-green-600 rounded-full flex items-center justify-center`}>
            <span className="text-white font-bold">✓</span>
          </div>
          <span className={`${textSizeClasses[size]} text-green-600 font-medium`}>
            Verified
          </span>
        </>
      ) : null}
    </div>
  );
}
