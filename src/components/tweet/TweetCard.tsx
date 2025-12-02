'use client';

import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Send, Eye, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tweet, Comment } from '@/types';
import { useTweetStore } from '@/store/tweetStore';
import { useUserStore } from '@/store/userStore';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
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
            <VerifiedBadge 
              user={tweet.author} 
              worldIdVerification={tweet.author.id === useUserStore.getState().user?.id ? worldIdVerification : null}
              size="sm"
            />
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
            <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
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
                      className="w-full max-h-96"
                    />
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
          </div>

          {/* Comments Modal */}
          {showComments && (
            <div 
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setShowComments(false)}
            >
              <div 
                className="bg-black border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-black border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Comments</h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-2xl leading-none">×</span>
                  </button>
                </div>

                {/* Comments List - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                  {commentsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00FFBD] border-t-transparent mx-auto"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group/comment">
                          <AvatarInitial
                            name={comment.author.displayName || comment.author.username || 'User'}
                            imageUrl={comment.author.profilePictureUrl || comment.author.avatar}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="bg-white/5 rounded-2xl px-3 sm:px-4 py-3 border border-white/5 hover:border-white/10 transition-all">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <button
                                  onClick={() => router.push(`/profile/${comment.author.id}`)}
                                  className="font-semibold text-white hover:text-[#00FFBD] transition-colors text-sm"
                                >
                                  {comment.author.displayName || comment.author.username}
                                </button>
                                <VerifiedBadge user={comment.author} size="sm" />
                                {comment.author.isSeasonOneOG && (
                                  <SeasonOneBadge size="sm" showLabel={false} />
                                )}
                                <span className="text-gray-500 text-xs">
                                  {formatTime(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-100 leading-relaxed text-sm sm:text-base break-words">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">💬</div>
                      <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>

                {/* Comment Form - Sticky at Bottom */}
                {user && (
                  <div className="sticky bottom-0 bg-black border-t border-white/10 px-4 sm:px-6 py-4">
                    <form onSubmit={handleCommentSubmit} className="flex gap-3">
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
                          className="flex-1 px-3 sm:px-4 py-2.5 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00FFBD] focus:border-transparent bg-white/5 text-white placeholder:text-gray-500 transition-all text-sm sm:text-base"
                          maxLength={280}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim() || commentSubmitting}
                          className="px-4 sm:px-5 py-2.5 bg-[#00FFBD] hover:bg-[#00D9A0] text-black font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all min-w-[44px]"
                        >
                          {commentSubmitting ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
