'use client';

import { useState } from 'react';
import { Send, ImageIcon, X } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useTweetStore } from '@/store/tweetStore';
import { CreateTweetData, Tweet } from '@/types';

interface ComposeTweetProps {
  onTweetCreated?: (tweet: Tweet) => void;
  placeholder?: string;
  maxLength?: number;
  compact?: boolean;
}

export default function ComposeTweet({
  onTweetCreated,
  placeholder = "What's happening?",
  maxLength = 280,
  compact = false,
}: ComposeTweetProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserStore();
  const { addTweet } = useTweetStore();

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

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;
  const canTweet = content.trim().length > 0 && !isOverLimit && !isLoading;

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-lg text-center py-8">
        <p className="text-muted-foreground mb-4">Sign in to post tweets</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-primary-foreground font-semibold overflow-hidden flex-shrink-0">
          {user.profilePictureUrl || user.avatar ? (
            <img
              src={user.profilePictureUrl || user.avatar}
              alt={`${user.username}'s avatar`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-lg">
              {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Compose Area */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[100px] p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-lg bg-background text-foreground"
            disabled={isLoading}
          />

          {/* Actions Bar */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="p-2 text-muted-foreground hover:text-accent hover:bg-muted rounded-full transition-colors"
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
                      ? 'border-destructive text-destructive'
                      : remainingChars < 20
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {remainingChars < 20 ? remainingChars : ''}
                </div>
              </div>

              {/* Tweet Button */}
              <button
                onClick={handleSubmit}
                disabled={!canTweet}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
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
