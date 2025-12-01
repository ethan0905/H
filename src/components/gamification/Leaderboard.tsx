'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types/gamification';
import { RankBadge } from './RankBadge';
import { HumanRank } from '@/types/gamification';

interface LeaderboardProps {
  type: string;
  region?: string;
  currentUserId?: string;
}

export function Leaderboard({ type, region, currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodInfo, setPeriodInfo] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [type, region]);

  async function fetchLeaderboard() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ type });
      if (region) params.append('region', region);

      const response = await fetch(`/api/gamification/leaderboards?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      
      if (data.success && data.leaderboard) {
        setEntries(data.leaderboard.entries);
        setPeriodInfo({
          start: data.leaderboard.periodStart,
          end: data.leaderboard.periodEnd,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-brand text-black rounded-lg hover:bg-brand/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No leaderboard data available yet</p>
        <p className="text-sm mt-2">Check back soon!</p>
      </div>
    );
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {periodInfo && (
        <div className="text-xs text-muted-foreground text-center mb-4">
          Period: {new Date(periodInfo.start).toLocaleDateString()} - {new Date(periodInfo.end).toLocaleDateString()}
        </div>
      )}

      <div className="space-y-2">
        {entries.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;
          const medal = getMedalIcon(entry.rankPosition);

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.01] ${
                isCurrentUser
                  ? 'bg-brand/10 border-brand'
                  : entry.rankPosition <= 3
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-card border-border'
              }`}
            >
              {/* Rank Position */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted font-bold text-lg">
                {medal || `#${entry.rankPosition}`}
              </div>

              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt={entry.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand">
                      {entry.displayName[0]}
                    </div>
                  )}
                </div>
                {entry.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-black text-xs font-bold">
                    ✓
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">
                    {entry.displayName}
                  </p>
                  {isCurrentUser && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand/20 text-brand">
                      You
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{entry.username}</p>
              </div>

              {/* Rank Badge */}
              <RankBadge rank={entry.currentRank as HumanRank} size="md" />

              {/* Score */}
              <div className="text-right">
                <p className="text-lg font-bold text-brand">
                  {Math.round(entry.score).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length >= 100 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Showing top 100 humans
        </div>
      )}
    </div>
  );
}
