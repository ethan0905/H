'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTweetStore } from '@/store/tweetStore';
import { useUserStore } from '@/store/userStore';
import TweetCard from '@/components/tweet/TweetCard';
import ComposeTweet from '@/components/tweet/ComposeTweet';
import AuthButton from '@/components/auth/AuthButton';
import { Tweet } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { tweets, loading, error, fetchTweets, hasMore } = useTweetStore();
  const { user, isAuthenticated, logout } = useUserStore();
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to World Social
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with the world through verified identities and decentralized conversations.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Join the Conversation
              </h2>
              <p className="text-gray-600 text-sm">
                Authenticate with World ID or connect your wallet to get started.
              </p>
            </div>
            
            <AuthButton />
            
            <div className="mt-6 text-xs text-gray-500">
              <p>
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">🔐</div>
              <p className="text-sm text-gray-600">Secure Authentication</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🌐</div>
              <p className="text-sm text-gray-600">Decentralized</p>
            </div>
            <div>
              <div className="text-2xl mb-2">✨</div>
              <p className="text-sm text-gray-600">Verified Identities</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">W</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">World Social</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                if (user) {
                  console.log('Header profile click, navigating to profile for user:', user.id);
                  router.push(`/profile/${encodeURIComponent(user.id)}`);
                }
              }}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
            >
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.displayName || user.username || 'User'}
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.displayName || user?.username}
              </span>
            </button>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Compose Tweet */}
        <div className="mb-6">
          <ComposeTweet />
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {loading && tweets.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-600 mb-2">⚠️</div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to Load Tweets
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchTweets()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : tweets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to World Social!
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share your thoughts with the world.
              </p>
              <ComposeTweet compact />
            </div>
          ) : (
            <>
              {tweets.map((tweet: Tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center py-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Tweets'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
