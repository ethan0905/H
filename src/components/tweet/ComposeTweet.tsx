'use client';

import { useState, useEffect } from 'react';
import { Send, ImageIcon, X, TrendingUp, Crown } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useTweetStore } from '@/store/tweetStore';
import { CreateTweetData, Tweet } from '@/types';
import { AvatarInitial } from '@/components/ui/AvatarInitial';
import { getSubscriptionLimits, isPostLengthValid, canUserPost, getRemainingPosts } from '@/lib/subscription-features';

interface ComposeTweetProps {
  onTweetCreated?: (tweet: Tweet) => void;
  placeholder?: string;
  maxLength?: number;
  compact?: boolean;
}

export default function ComposeTweet({
  onTweetCreated,
  placeholder = "What's happening?",
  maxLength,
  compact = false,
}: ComposeTweetProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');
  const [postsToday, setPostsToday] = useState(0);
  const { user } = useUserStore();
  const { addTweet } = useTweetStore();
  
  // Get subscription limits
  const limits = getSubscriptionLimits(subscriptionTier);
  const effectiveMaxLength = maxLength || limits.maxCharactersPerPost;
  
  // Calculate estimated earnings
  const estimatedEarnings = Math.min(content.length * 0.05, 50);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/subscriptions/status');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionTier(data.plan === 'pro' ? 'pro' : 'free');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Track posts today (simplified - in production, fetch from API)
  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('postsToday');
    if (storedData) {
      const { date, count } = JSON.parse(storedData);
      if (date === today) {
        setPostsToday(count);
      } else {
        setPostsToday(0);
        localStorage.setItem('postsToday', JSON.stringify({ date: today, count: 0 }));
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || !user || isLoading) return;

    try {
      setIsLoading(true);

      // Create tweet data
      const tweetData = {
        content: content.trim(),
        userId: user.id,
      };

      // In a real app, you'd send this to your backend
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetData),
      });

      if (!response.ok) {
        throw new Error('Failed to create tweet');
      }

      const newTweet: Tweet = await response.json();
      
      // Add to store
      addTweet(newTweet);
      
      // Update posts today counter
      const today = new Date().toDateString();
      const newCount = postsToday + 1;
      setPostsToday(newCount);
      localStorage.setItem('postsToday', JSON.stringify({ date: today, count: newCount }));
      
      // Store earnings data in localStorage for earnings view
      const currentEarnings = JSON.parse(localStorage.getItem('user_earnings') || '{"total": 0, "last7Days": []}');
      const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      const todayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(todayShort);
      
      // Update earnings
      currentEarnings.total = (currentEarnings.total || 0) + estimatedEarnings;
      if (!currentEarnings.last7Days) currentEarnings.last7Days = [];
      
      // Find or create today's entry
      const todayEntry = currentEarnings.last7Days.find((d: any) => d.day === todayShort);
      if (todayEntry) {
        todayEntry.amount += estimatedEarnings;
      } else {
        currentEarnings.last7Days.push({ day: todayShort, amount: estimatedEarnings });
      }
      
      localStorage.setItem('user_earnings', JSON.stringify(currentEarnings));
      
      // Clear form
      setContent('');
      
      // Notify parent
      onTweetCreated?.(newTweet);

    } catch (error) {
      console.error('Error creating tweet:', error);
      // In a real app, show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const remainingChars = effectiveMaxLength - content.length;
  const isOverLimit = remainingChars < 0;
  const hasPostsRemaining = canUserPost(subscriptionTier, postsToday);
  const canTweet = content.trim().length > 0 && !isOverLimit && !isLoading && hasPostsRemaining;

  if (!user) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg text-center py-8">
        <p className="text-gray-400 mb-4">Sign in to post tweets</p>
      </div>
    );
  }

  // Check if user has reached daily post limit
  const postsRemaining = getRemainingPosts(subscriptionTier, postsToday);
  const hasReachedLimit = !hasPostsRemaining;

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-4">
      {/* Subscription Info Banner */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {subscriptionTier === 'pro' ? (
            <>
              <Crown className="w-4 h-4 text-[#00FFBD]" />
              <span className="text-[#00FFBD] font-semibold">Pro Creator</span>
            </>
          ) : (
            <span className="text-gray-500">Free Plan</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`${hasReachedLimit ? 'text-red-500' : 'text-gray-400'}`}>
            {typeof postsRemaining === 'string' ? postsRemaining : `${postsRemaining} posts left today`}
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">{effectiveMaxLength} chars max</span>
        </div>
      </div>

      {hasReachedLimit && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400 font-semibold">Daily post limit reached</p>
              <p className="text-xs text-gray-400 mt-1">
                Upgrade to Pro for unlimited posts or wait until tomorrow.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        {/* User Avatar */}
        <AvatarInitial 
          name={user.displayName || user.username || 'U'}
          imageUrl={user.profilePictureUrl || user.avatar}
          size="md"
        />

        {/* Compose Area */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={hasReachedLimit ? 'Daily post limit reached. Upgrade to Pro for unlimited posts.' : placeholder}
            className="w-full min-h-[100px] p-3 border border-gray-800 rounded-lg resize-none focus:ring-2 focus:ring-[#00FFBD] focus:border-transparent outline-none text-lg bg-black text-white placeholder-gray-500 disabled:opacity-50"
            disabled={isLoading || hasReachedLimit}
          />

          {/* Estimated Earnings Preview */}
          {content.length > 0 && (
            <div className="mt-3 border rounded-lg p-3" style={{ backgroundColor: "#00FFBD10", borderColor: "#00FFBD30" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: "#00FFBD" }} />
                  <span className="text-xs font-semibold text-gray-300">Estimated Earnings</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "#00FFBD" }}>
                  ${estimatedEarnings.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 relative h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((estimatedEarnings / 50) * 100, 100)}%`, backgroundColor: "#00FFBD" }}
                />
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-[#00FFBD] hover:bg-gray-900 rounded-full transition-colors"
                title="Add image"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Character Count */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                    isOverLimit
                      ? 'border-red-500 text-red-500'
                      : remainingChars < 20
                      ? 'border-yellow-500 text-yellow-500'
                      : 'border-gray-700 text-gray-400'
                  }`}
                >
                  {remainingChars < 20 ? remainingChars : ''}
                </div>
              </div>

              {/* Tweet Button */}
              <button
                onClick={handleSubmit}
                disabled={!canTweet}
                className="bg-[#00FFBD] hover:bg-[#00E5A8] text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition-all disabled:hover:bg-[#00FFBD] shadow-[0_0_20px_rgba(0,255,189,0.3)] hover:shadow-[0_0_30px_rgba(0,255,189,0.5)]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send size={16} />
                    <span>Tweet</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
