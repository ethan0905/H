'use client';

import { HumanRank } from '@/types/gamification';
import { getRankDisplayName, getRankColor } from '@/lib/gamification/rankService';
import { RankBadge } from './RankBadge';

interface RankProgressProps {
  currentRank: HumanRank;
  nextRank: HumanRank | null;
  progressToNext: number;
  rankScore: number;
  requirements?: {
    met: string[];
    pending: string[];
  };
}

export function RankProgress({
  currentRank,
  nextRank,
  progressToNext,
  rankScore,
  requirements,
}: RankProgressProps) {
  const currentColor = getRankColor(currentRank);
  const progressPercent = Math.round(progressToNext * 100);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Your Rank</h3>
          <div className="flex items-center gap-2">
            <RankBadge rank={currentRank} size="lg" showLabel />
            <span className="text-sm text-muted-foreground">
              {rankScore.toLocaleString()} points
            </span>
          </div>
        </div>
        {nextRank && nextRank !== 'HUMAN_INFINITY' && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Next Rank</p>
            <RankBadge rank={nextRank} size="md" showLabel />
          </div>
        )}
      </div>

      {nextRank && nextRank !== 'HUMAN_INFINITY' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold" style={{ color: currentColor }}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: currentColor,
              }}
            />
          </div>
        </div>
      )}

      {nextRank === 'HUMAN_INFINITY' && (
        <div className="mt-4 p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
          <p className="text-sm text-pink-400">
            ∞ <strong>Human Infinity</strong> can only be achieved through votes from the community.
            You need 10+ votes from HUMAN_LEGEND or HUMAN_INFINITY users.
          </p>
        </div>
      )}

      {requirements && (
        <div className="mt-6 space-y-4">
          {requirements.met.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Completed</h4>
              <ul className="space-y-1">
                {requirements.met.map((req, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requirements.pending.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-400 mb-2">→ In Progress</h4>
              <ul className="space-y-1">
                {requirements.pending.map((req, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400">○</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
