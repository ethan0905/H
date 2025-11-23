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
    <div className="p-4 hover:bg-card transition cursor-pointer border-b border-border">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full cursor-pointer overflow-hidden border-2" 
            onClick={() => handleProfileClick(tweet.author.id)}
            style={{ borderColor: '#A2A2A2' }}
          >
            {tweet.author.profilePictureUrl ? (
              <img
                src={tweet.author.profilePictureUrl}
                alt={`${tweet.author.username}'s avatar`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center font-semibold text-lg rounded-full" 
                style={{ 
                  backgroundColor: '#000000', 
                  color: '#FFFFFF',
                  border: '2px solid #A2A2A2'
                }}
              >
                {(tweet.author.displayName || tweet.author.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Tweet Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-2">
            <button 
              onClick={() => handleProfileClick(tweet.author.id)}
              className="font-semibold text-foreground truncate hover:underline text-left"
            >
              {tweet.author.displayName || tweet.author.username}
            </button>
            <VerifiedBadge 
              user={tweet.author} 
              worldIdVerification={tweet.author.id === useUserStore.getState().user?.id ? worldIdVerification : null}
              size="sm"
            />
            <button 
              onClick={() => handleProfileClick(tweet.author.id)}
              className="text-muted-foreground text-sm hover:underline"
            >
              @{tweet.author.username}
            </button>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {formatTime(tweet.createdAt)}
            </span>
            <div className="ml-auto flex items-center space-x-1">
              <button
                onClick={() => handleProfileClick(tweet.author.id)}
                className="px-2 py-1 text-xs bg-muted hover:bg-accent rounded-full text-muted-foreground transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-foreground whitespace-pre-wrap">
              {tweet.content}
            </p>
          </div>

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className="mb-3 rounded-lg overflow-hidden border border-border">
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
          <div className="flex items-center space-x-8 text-muted-foreground">
            <button
              onClick={handleToggleComments}
              className={`flex items-center space-x-2 hover:text-accent transition-colors ${
                showComments ? 'text-accent' : ''
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
              className={`flex items-center space-x-2 hover:text-[#FF0000] transition-colors ${
                tweet.isLiked ? 'text-[#FF0000]' : ''
              }`}
            >
              <Heart size={18} fill={tweet.isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{tweet.likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 hover:text-accent transition-colors"
            >
              <Share size={18} />
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 border-t border-border pt-4">
              {/* Comment Form */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-4">
                  <div className="flex space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
                      style={{
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        border: '2px solid #A2A2A2'
                      }}
                    >
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
                          className="flex-1 px-3 py-2 border border-border rounded-l-full focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-background text-foreground"
                          maxLength={280}
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim() || commentSubmitting}
                          className="px-4 py-2 bg-brand hover:bg-brand-600 text-black font-semibold rounded-r-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {commentSubmitting ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent mx-auto"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
                        style={{
                          backgroundColor: '#000000',
                          color: '#FFFFFF',
                          border: '2px solid #A2A2A2'
                        }}
                      >
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
                        <div className="bg-card rounded-lg px-3 py-2 border border-border">
                          <div className="flex items-center space-x-2 mb-1">
                            <button
                              onClick={() => router.push(`/profile/${comment.author.id}`)}
                              className="font-semibold text-foreground hover:underline"
                            >
                              {comment.author.displayName || comment.author.username}
                            </button>
                            <VerifiedBadge user={comment.author} size="sm" />
                            <span className="text-muted-foreground text-xs">
                              {formatTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-foreground text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
