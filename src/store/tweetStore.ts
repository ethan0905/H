'use client';

import { create } from 'zustand';
import { Tweet, CreateTweetData } from '@/types';

interface TweetState {
  tweets: Tweet[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  fetchTweets: (offset?: number, userId?: string) => Promise<void>;
  setTweets: (tweets: Tweet[]) => void;
  addTweet: (tweet: Tweet) => void;
  updateTweet: (tweetId: string, updates: Partial<Tweet>) => void;
  deleteTweet: (tweetId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  clearError: () => void;
  
  // Tweet interactions
  likeTweet: (tweetId: string, userId: string) => Promise<void>;
  retweetTweet: (tweetId: string, userId: string) => Promise<void>;
}

export const useTweetStore = create<TweetState>((set, get) => ({
  tweets: [],
  loading: false,
  error: null,
  hasMore: true,

  fetchTweets: async (offset = 0, userId?: string) => {
    try {
      set({ loading: true, error: null });
      
      let url = `/api/tweets?offset=${offset}&limit=20`;
      if (userId) {
        url += `&userId=${encodeURIComponent(userId)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tweets');
      }
      
      const { tweets: newTweets, hasMore } = data;
      
      if (offset === 0) {
        set({ tweets: newTweets, hasMore, loading: false });
      } else {
        set(state => ({ 
          tweets: [...state.tweets, ...newTweets], 
          hasMore, 
          loading: false 
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tweets',
        loading: false 
      });
    }
  },

  setTweets: (tweets: Tweet[]) => {
    set({ tweets, error: null });
  },

  addTweet: (tweet: Tweet) => {
    set((state) => ({
      tweets: [tweet, ...state.tweets],
      error: null,
    }));
  },

  updateTweet: (tweetId: string, updates: Partial<Tweet>) => {
    set((state) => ({
      tweets: state.tweets.map((tweet) =>
        tweet.id === tweetId ? { ...tweet, ...updates } : tweet
      ),
    }));
  },

  deleteTweet: (tweetId: string) => {
    set((state) => ({
      tweets: state.tweets.filter((tweet) => tweet.id !== tweetId),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setHasMore: (hasMore: boolean) => {
    set({ hasMore });
  },

  clearError: () => {
    set({ error: null });
  },

  likeTweet: async (tweetId: string, userId: string) => {
    try {
      // Get current state before optimistic update
      const currentTweet = get().tweets.find(t => t.id === tweetId);
      const wasLiked = currentTweet?.isLiked || false;
      const action = wasLiked ? 'unlike' : 'like';

      // Optimistically update UI
      set((state) => ({
        tweets: state.tweets.map((tweet) =>
          tweet.id === tweetId
            ? {
                ...tweet,
                isLiked: !tweet.isLiked,
                likes: tweet.isLiked ? tweet.likes - 1 : tweet.likes + 1,
              }
            : tweet
        ),
      }));

      // Send request to backend
      const response = await fetch('/api/tweets/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tweetId, action }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        set((state) => ({
          tweets: state.tweets.map((tweet) =>
            tweet.id === tweetId
              ? {
                  ...tweet,
                  isLiked: wasLiked,
                  likes: wasLiked ? tweet.likes + 1 : tweet.likes - 1,
                }
              : tweet
          ),
        }));
        throw new Error('Failed to update like');
      }

      const data = await response.json();
      // Update with actual counts from server
      set((state) => ({
        tweets: state.tweets.map((tweet) =>
          tweet.id === tweetId
            ? {
                ...tweet,
                likes: data.counts.likes,
                retweets: data.counts.retweets,
              }
            : tweet
        ),
      }));
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  },

  retweetTweet: async (tweetId: string, userId: string) => {
    try {
      // Get current state before optimistic update
      const currentTweet = get().tweets.find(t => t.id === tweetId);
      const wasRetweeted = currentTweet?.isRetweeted || false;
      const action = wasRetweeted ? 'unretweet' : 'retweet';

      // Optimistically update UI
      set((state) => ({
        tweets: state.tweets.map((tweet) =>
          tweet.id === tweetId
            ? {
                ...tweet,
                isRetweeted: !tweet.isRetweeted,
                retweets: tweet.isRetweeted ? tweet.retweets - 1 : tweet.retweets + 1,
              }
            : tweet
        ),
      }));

      // Send request to backend
      const response = await fetch('/api/tweets/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tweetId, action }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        set((state) => ({
          tweets: state.tweets.map((tweet) =>
            tweet.id === tweetId
              ? {
                  ...tweet,
                  isRetweeted: wasRetweeted,
                  retweets: wasRetweeted ? tweet.retweets + 1 : tweet.retweets - 1,
                }
              : tweet
          ),
        }));
        throw new Error('Failed to update retweet');
      }

      const data = await response.json();
      // Update with actual counts from server
      set((state) => ({
        tweets: state.tweets.map((tweet) =>
          tweet.id === tweetId
            ? {
                ...tweet,
                likes: data.counts.likes,
                retweets: data.counts.retweets,
              }
            : tweet
        ),
      }));
    } catch (error) {
      console.error('Error retweeting tweet:', error);
    }
  },
}));
