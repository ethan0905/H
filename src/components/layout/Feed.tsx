"use client"

import { useState, useEffect } from "react"
import { useTweetStore } from '@/store/tweetStore';
import { useUserStore } from '@/store/userStore';
import TweetCard from '@/components/tweet/TweetCard';
import ComposeTweet from '@/components/tweet/ComposeTweet';

interface FeedProps {
  userId: string | null
  profile: any
}

export function Feed({ userId, profile }: FeedProps) {
  const { tweets, loading, error, fetchTweets, hasMore } = useTweetStore();
  const { user, isAuthenticated } = useUserStore();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTweets(0, user.id);
    } else {
      fetchTweets();
    }
  }, [fetchTweets, isAuthenticated, user]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      await fetchTweets(tweets.length, user?.id);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="w-full sm:max-w-2xl sm:mx-auto sm:border-l sm:border-r border-border">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-border px-4 py-3 sm:p-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Your Feed</h2>
      </div>

      {/* Compose Tweet */}
      <div className="border-b border-border">
        <ComposeTweet />
      </div>

      {/* Feed */}
      <div className="divide-y divide-border">
        {loading && tweets.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="text-destructive mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-destructive-foreground mb-2">
              Failed to Load Tweets
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => fetchTweets()}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : tweets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Welcome to World Social!
            </h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your thoughts with the world.
            </p>
          </div>
        ) : (
          <>
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="p-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Tweets'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
