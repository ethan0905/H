'use client';

import { useState } from 'react';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { useUserStore } from '@/store/userStore';

type TabType = 'global' | 'regional' | 'weekly';
type GlobalLeaderboardType =
  | 'GLOBAL_TOP_HUMANS'
  | 'GLOBAL_TOP_CREATORS'
  | 'GLOBAL_TOP_HELPERS'
  | 'GLOBAL_TOP_VETERANS'
  | 'GLOBAL_TOP_EXPLORERS'
  | 'GLOBAL_TOP_EARNERS';

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [globalType, setGlobalType] = useState<GlobalLeaderboardType>('GLOBAL_TOP_HUMANS');
  const [weeklyType, setWeeklyType] = useState<'WEEKLY_TOP_HUMANS' | 'WEEKLY_TOP_CREATORS'>(
    'WEEKLY_TOP_HUMANS'
  );
  const { user } = useUserStore();

  const globalLeaderboards = [
    { id: 'GLOBAL_TOP_HUMANS', name: 'Top Humans', icon: '👑', desc: 'Overall influence' },
    { id: 'GLOBAL_TOP_CREATORS', name: 'Top Creators', icon: '✍️', desc: 'Content kings' },
    { id: 'GLOBAL_TOP_HELPERS', name: 'Top Helpers', icon: '🤝', desc: 'Community heroes' },
    { id: 'GLOBAL_TOP_VETERANS', name: 'Top Veterans', icon: '🎖️', desc: 'Long-term members' },
    { id: 'GLOBAL_TOP_EXPLORERS', name: 'Top Explorers', icon: '🌍', desc: 'Network builders' },
    { id: 'GLOBAL_TOP_EARNERS', name: 'Top Earners', icon: '💰', desc: 'Financial winners' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🏆 Best Humans on the Planet
          </h1>
          <p className="text-muted-foreground">
            Compete with verified humans worldwide
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'global'
                ? 'bg-brand text-black'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setActiveTab('regional')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'regional'
                ? 'bg-brand text-black'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            📍 Near You
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'weekly'
                ? 'bg-brand text-black'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            📅 This Week
          </button>
        </div>

        {/* Global Leaderboards */}
        {activeTab === 'global' && (
          <div className="space-y-6">
            {/* Leaderboard Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {globalLeaderboards.map((lb) => (
                <button
                  key={lb.id}
                  onClick={() => setGlobalType(lb.id as GlobalLeaderboardType)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    globalType === lb.id
                      ? 'bg-brand/10 border-brand'
                      : 'bg-card border-border hover:border-brand/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{lb.icon}</div>
                  <h3 className="font-semibold text-foreground text-sm">{lb.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{lb.desc}</p>
                </button>
              ))}
            </div>

            {/* Selected Leaderboard */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {globalLeaderboards.find((lb) => lb.id === globalType)?.name}
              </h2>
              <Leaderboard type={globalType} currentUserId={user?.id} />
            </div>
          </div>
        )}

        {/* Regional Leaderboards */}
        {activeTab === 'regional' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-2">
                📍 Your Region
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {user?.country ? `Showing leaderboard for ${user.country}` : 'Set your location in profile to see regional rankings'}
              </p>
              {user?.country ? (
                <Leaderboard
                  type="REGIONAL_TOP_CREATORS"
                  region={user.country}
                  currentUserId={user.id}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Set your location in your profile to view regional leaderboards</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weekly Leaderboards */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {/* Weekly Type Selector */}
            <div className="flex gap-3">
              <button
                onClick={() => setWeeklyType('WEEKLY_TOP_HUMANS')}
                className={`flex-1 p-4 rounded-lg border transition-all ${
                  weeklyType === 'WEEKLY_TOP_HUMANS'
                    ? 'bg-brand/10 border-brand'
                    : 'bg-card border-border hover:border-brand/50'
                }`}
              >
                <div className="text-2xl mb-2">👑</div>
                <h3 className="font-semibold text-foreground">Top Humans</h3>
                <p className="text-xs text-muted-foreground mt-1">This week's best</p>
              </button>
              <button
                onClick={() => setWeeklyType('WEEKLY_TOP_CREATORS')}
                className={`flex-1 p-4 rounded-lg border transition-all ${
                  weeklyType === 'WEEKLY_TOP_CREATORS'
                    ? 'bg-brand/10 border-brand'
                    : 'bg-card border-border hover:border-brand/50'
                }`}
              >
                <div className="text-2xl mb-2">✍️</div>
                <h3 className="font-semibold text-foreground">Top Creators</h3>
                <p className="text-xs text-muted-foreground mt-1">Weekly content stars</p>
              </button>
            </div>

            {/* Selected Weekly Leaderboard */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {weeklyType === 'WEEKLY_TOP_HUMANS' ? 'Weekly Top Humans' : 'Weekly Top Creators'}
                </h2>
                <span className="px-3 py-1 bg-brand/20 text-brand text-xs font-semibold rounded-full">
                  Resets Weekly
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Fresh competition every week - everyone has a chance to win!
              </p>
              <Leaderboard type={weeklyType} currentUserId={user?.id} />
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-muted rounded-xl">
          <h3 className="font-semibold text-foreground mb-2">💡 How to Rank Up</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Post quality content and engage with the community</li>
            <li>• Maintain daily streaks for consistency bonuses</li>
            <li>• Help other humans with comments and support</li>
            <li>• Invite verified humans to grow the network</li>
            <li>• Earn Human Infinity by receiving votes from legends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
