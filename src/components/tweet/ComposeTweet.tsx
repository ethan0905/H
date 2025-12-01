'use client';

import { useState } from 'react';
import { Send, ImageIcon, X } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useTweetStore } from '@/store/tweetStore';
import { CreateTweetData, Tweet } from '@/types';
import { AvatarInitial } from '@/components/ui/AvatarInitial';

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
      <div className="bg-black border border-gray-800 rounded-lg text-center py-8">
        <p className="text-gray-400 mb-4">Sign in to post tweets</p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-4">
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
            placeholder={placeholder}
            className="w-full min-h-[100px] p-3 border border-gray-800 rounded-lg resize-none focus:ring-2 focus:ring-[#00FFBD] focus:border-transparent outline-none text-lg bg-black text-white placeholder-gray-500"
            disabled={isLoading}
          />

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
