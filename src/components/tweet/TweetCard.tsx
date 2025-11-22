'use client';

import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tweet, Comment } from '@/types';
import { useTweetStore } from '@/store/tweetStore';
import { useUserStore } from '@/store/userStore';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const router = useRouter();
  const { likeTweet, retweetTweet } = useTweetStore();
  const { user, worldIdVerification } = useUserStore();

  const handleLike = async () => {
    if (!user) {
      console.warn('User must be logged in to like tweets');
      return;
    }
    await likeTweet(tweet.id, user.id);
  };

  const handleRetweet = async () => {
    if (!user) {
      console.warn('User must be logged in to retweet tweets');
      return;
    }
    await retweetTweet(tweet.id, user.id);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Tweet by ${tweet.author.displayName || tweet.author.username}`,
        text: tweet.content,
        url: `${window.location.origin}/tweet/${tweet.id}`,
      });
    } catch (error) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${window.location.origin}/tweet/${tweet.id}`);
    }
  };

  const fetchComments = async () => {
    if (commentsLoading) return;
    
    setCommentsLoading(true);
    try {
      let url = `/api/tweets/${tweet.id}/comments`;
      if (user) {
        url += `?currentUserId=${encodeURIComponent(user.id)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim() || commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      const response = await fetch(`/api/tweets/${tweet.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText.trim(),
          authorId: user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
        // Update the tweet's replies count in the tweet store
        tweet.replies = comments.length + 1;
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  const formatTime = (date: string | Date) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="tweet-card">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="user-avatar">
          {tweet.author.profilePictureUrl ? (
            <img
              src={tweet.author.profilePictureUrl}
              alt={`${tweet.author.username}'s avatar`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>
              {(tweet.author.displayName || tweet.author.username || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Tweet Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-2">
            <button 
              onClick={() => {
                console.log('Navigating to profile:', tweet.author.id);
                const encodedUserId = encodeURIComponent(tweet.author.id);
                console.log('Encoded user ID:', encodedUserId);
                router.push(`/profile/${encodedUserId}`);
              }}
              className="font-semibold text-gray-900 truncate hover:underline text-left"
            >
              {tweet.author.displayName || tweet.author.username}
            </button>
            <VerifiedBadge 
              user={tweet.author} 
              worldIdVerification={tweet.author.id === useUserStore.getState().user?.id ? worldIdVerification : null}
              size="sm"
            />
            <button 
              onClick={() => {
                console.log('Navigating to profile:', tweet.author.id);
                const encodedUserId = encodeURIComponent(tweet.author.id);
                console.log('Encoded user ID:', encodedUserId);
                router.push(`/profile/${encodedUserId}`);
              }}
              className="text-gray-500 text-sm hover:underline"
            >
              @{tweet.author.username}
            </button>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">
              {formatTime(tweet.createdAt)}
            </span>
            <div className="ml-auto flex items-center space-x-1">
              <button
                onClick={() => {
                  console.log('Profile button clicked for:', tweet.author.id);
                  const encodedUserId = encodeURIComponent(tweet.author.id);
                  console.log('Encoded user ID:', encodedUserId);
                  router.push(`/profile/${encodedUserId}`);
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-gray-900 whitespace-pre-wrap">
              {tweet.content}
            </p>
          </div>

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className="mb-3 rounded-lg overflow-hidden">
              {tweet.media.map((item) => (
                <div key={item.id}>
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt || 'Tweet image'}
                      className="w-full max-h-96 object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className="w-full max-h-96"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-8 text-gray-500">
            <button
              onClick={handleToggleComments}
              className={`flex items-center space-x-2 hover:text-blue-500 transition-colors ${
                showComments ? 'text-blue-500' : ''
              }`}
            >
              <MessageCircle size={18} />
              <span className="text-sm">{showComments ? comments.length : tweet.replies}</span>
            </button>

            <button
              onClick={handleRetweet}
              className={`flex items-center space-x-2 hover:text-green-500 transition-colors ${
                tweet.isRetweeted ? 'text-green-500' : ''
              }`}
            >
              <Repeat2 size={18} />
              <span className="text-sm">{tweet.retweets}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
                tweet.isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart size={18} fill={tweet.isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{tweet.likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
            >
              <Share size={18} />
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              {/* Comment Form */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-4">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 overflow-hidden">
                      {user.profilePictureUrl || user.avatar ? (
                        <img
                          src={user.profilePictureUrl || user.avatar}
                          alt={user.displayName || user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (user.displayName || user.username || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={280}
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim() || commentSubmitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {commentSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              {commentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 overflow-hidden">
                        {comment.author.profilePictureUrl || comment.author.avatar ? (
                          <img
                            src={comment.author.profilePictureUrl || comment.author.avatar}
                            alt={comment.author.displayName || comment.author.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (comment.author.displayName || comment.author.username || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <button
                              onClick={() => router.push(`/profile/${comment.author.id}`)}
                              className="font-semibold text-gray-900 hover:underline"
                            >
                              {comment.author.displayName || comment.author.username}
                            </button>
                            <VerifiedBadge user={comment.author} size="sm" />
                            <span className="text-gray-500 text-xs">
                              {formatTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-900 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
