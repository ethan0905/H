'use client';

import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Send, Eye, Coins, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tweet, Comment } from '@/types';
import { useTweetStore } from '@/store/tweetStore';
import { useUserStore } from '@/store/userStore';
import { SeasonOneBadge } from '@/components/ui/SeasonOneBadge';
import { AvatarInitial } from '@/components/ui/AvatarInitial';

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
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleProfileClick = (userId: string) => {
    console.log('Navigating to profile:', userId);
    const encodedUserId = encodeURIComponent(userId);
    console.log('Encoded user ID:', encodedUserId);
    router.push(`/profile/${encodedUserId}`);
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

  const handleDelete = async () => {
    if (!user) return;
    
    const isOwner = user.id === tweet.author.id;
    const isSuperAdmin = user.isSuperAdmin === true;
    
    if (!isOwner && !isSuperAdmin) return;
    
    const confirmMessage = isSuperAdmin && !isOwner
      ? 'Are you sure you want to delete this tweet? (Super Admin Action)'
      : 'Are you sure you want to delete this tweet?';
    
    if (!confirm(confirmMessage)) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tweets/${tweet.id}?userId=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the page or remove tweet from UI
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete tweet');
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
      alert('Failed to delete tweet');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if user can delete this tweet
  const canDelete = user && (user.id === tweet.author.id || user.isSuperAdmin === true);

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
    <div className="p-4 hover:bg-white/[0.02] transition-all duration-200 border-b border-white/10 group">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <button 
            onClick={() => handleProfileClick(tweet.author.id)}
            className="transition-transform hover:scale-105"
          >
            <AvatarInitial
              name={tweet.author.displayName || tweet.author.username || 'User'}
              imageUrl={tweet.author.profilePictureUrl}
              size="md"
              className="cursor-pointer"
            />
          </button>
        </div>

        {/* Tweet Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">            <button
              onClick={() => handleProfileClick(tweet.author.id)}
              className="font-semibold text-white hover:text-[#00FFBD] transition-colors"
            >
              {tweet.author.displayName || tweet.author.username}
            </button>
            {tweet.author.isSeasonOneOG && (
              <SeasonOneBadge size="sm" showLabel={false} />
            )}
            <button 
              onClick={() => handleProfileClick(tweet.author.id)}
              className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
            >
              @{tweet.author.username}
            </button>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">
              {formatTime(tweet.createdAt)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-gray-100 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {tweet.content}
            </p>
          </div>

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
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
                      preload="metadata"
                      poster={item.thumbnailUrl || undefined}
                      className="w-full max-h-96 bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats Row - Views & Earnings */}
          {(tweet.views || tweet.earnings) && (
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
              {tweet.views && (
                <div className="flex items-center gap-1.5">
                  <Eye size={16} />
                  <span>{tweet.views.toLocaleString()}</span>
                </div>
              )}
              {tweet.earnings && (
                <div className="flex items-center gap-1.5 text-[#00FFBD]">
                  <Coins size={16} />
                  <span>{tweet.earnings.toFixed(2)} H</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-6 text-gray-500">
            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-2 hover:text-[#00FFBD] transition-all group/btn ${
                showComments ? 'text-[#00FFBD]' : ''
              }`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-[#00FFBD]/10 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm font-medium">{showComments ? comments.length : tweet.replies}</span>
            </button>

            <button
              onClick={handleRetweet}
              className={`flex items-center gap-2 hover:text-green-400 transition-all group/btn ${
                tweet.isRetweeted ? 'text-green-400' : ''
              }`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-green-400/10 transition-colors">
                <Repeat2 size={18} />
              </div>
              <span className="text-sm font-medium">{tweet.retweets}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 hover:text-red-500 transition-all group/btn ${
                tweet.isLiked ? 'text-red-500' : ''
              }`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-red-500/10 transition-colors">
                <Heart 
                  size={18} 
                  fill={tweet.isLiked ? 'currentColor' : 'none'}
                  className={tweet.isLiked ? 'animate-pulse' : ''}
                />
              </div>
              <span className="text-sm font-medium">{tweet.likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-blue-400 transition-all group/btn ml-auto"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-blue-400/10 transition-colors">
                <Share size={18} />
              </div>
            </button>

            {/* Delete Button - Super Admin & Author Only */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className={`flex items-center gap-2 hover:text-red-600 transition-all group/btn ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isDeleting}
              >
                <div className="p-2 rounded-full group-hover/btn:bg-red-600/10 transition-colors">
                  <Trash2 size={18} />
                </div>
              </button>
            )}
          </div>

          {/* Comments Section - Inline */}
          {showComments && (
            <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
              {/* Comments List */}
              {commentsLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00FFBD] border-t-transparent mx-auto"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <AvatarInitial
                        name={comment.author.displayName || comment.author.username || 'User'}
                        imageUrl={comment.author.profilePictureUrl || comment.author.avatar}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <button
                              onClick={() => router.push(`/profile/${comment.author.id}`)}
                              className="font-semibold text-white hover:text-[#00FFBD] transition-colors text-xs"
                            >
                              {comment.author.displayName || comment.author.username}
                            </button>
                            {comment.author.isSeasonOneOG && (
                              <SeasonOneBadge size="sm" showLabel={false} />
                            )}
                            <span className="text-gray-500 text-xs">
                              {formatTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm leading-relaxed break-words">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}

              {/* Comment Form */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
                  <AvatarInitial
                    name={user.displayName || user.username || 'User'}
                    imageUrl={user.profilePictureUrl || user.avatar}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00FFBD] focus:border-transparent bg-white/5 text-white placeholder:text-gray-500 transition-all text-sm"
                      maxLength={280}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || commentSubmitting}
                      className="px-4 py-2 bg-[#00FFBD] hover:bg-[#00D9A0] text-black font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                      {commentSubmitting ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
