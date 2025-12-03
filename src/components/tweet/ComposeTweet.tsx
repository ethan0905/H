'use client';

import { useState, useEffect } from 'react';
import { Send, ImageIcon, X, TrendingUp, Crown, Video } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
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
        const response = await fetch(`/api/subscriptions/status?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubscriptionTier(data.plan === 'pro' ? 'pro' : 'free');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Fallback to user.isPro if API fails
        setSubscriptionTier(user.isPro ? 'pro' : 'free');
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('📹 [CLIENT] Video selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      e.target.value = ''; // Reset file input
      return;
    }
    
    // Validate file size (max 50MB to match server)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('Video size must be less than 50MB');
      e.target.value = ''; // Reset file input
      return;
    }

    // Check video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      alert('Unable to load video. Please try a different file.');
      e.target.value = ''; // Reset file input
    };
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      
      if (duration > 120) { // 2 minutes = 120 seconds
        alert('Video duration must be 2 minutes or less');
        e.target.value = ''; // Reset file input
        return;
      }
      
      setSelectedVideo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    };
    
    video.src = URL.createObjectURL(file);
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user || isLoading) return;

    try {
      setIsLoading(true);
      
      // Store current values
      const tweetContent = content.trim();
      const imageFile = selectedImage;
      const videoFile = selectedVideo;

      let mediaUrl = null;
      let thumbnailUrl = null;
      let mediaType: 'image' | 'video' | null = null;
      
      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData.url;
        thumbnailUrl = uploadData.thumbnailUrl;
        mediaType = 'image';
      }
      
      // Upload video if selected
      if (videoFile) {
        setUploadingVideo(true);
        console.log('📤 [CLIENT] Starting video upload...');
        
        try {
          const formData = new FormData();
          formData.append('video', videoFile);
          
          // Add timeout to the fetch request (60 seconds)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.error('⏱️ [CLIENT] Upload timeout');
            controller.abort();
          }, 60000);
          
          const uploadResponse = await fetch('/api/upload-video', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          setUploadingVideo(false);
          
          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            console.error('❌ [CLIENT] Upload failed:', error);
            throw new Error(error.error || 'Failed to upload video');
          }
          
          const uploadData = await uploadResponse.json();
          console.log('✅ [CLIENT] Video uploaded successfully:', {
            url: uploadData.url,
            uploadTime: uploadData.uploadTime
          });
          
          mediaUrl = uploadData.url;
          thumbnailUrl = uploadData.thumbnailUrl;
          mediaType = 'video';
        } catch (uploadError: any) {
          setUploadingVideo(false);
          
          if (uploadError.name === 'AbortError') {
            throw new Error('Video upload timed out. Please try a smaller video or check your internet connection.');
          }
          throw uploadError;
        }
      }

      // Create tweet data
      const tweetData = {
        content: tweetContent,
        userId: user.id,
        media: mediaUrl ? [{
          type: mediaType,
          url: mediaUrl,
          thumbnailUrl: thumbnailUrl
        }] : undefined,
      };

      // Send to backend
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
      
      // Update counters
      const today = new Date().toDateString();
      const newCount = postsToday + 1;
      setPostsToday(newCount);
      localStorage.setItem('postsToday', JSON.stringify({ date: today, count: newCount }));
      
      // Update earnings
      const currentEarnings = JSON.parse(localStorage.getItem('user_earnings') || '{"total": 0, "last7Days": []}');
      const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      currentEarnings.total = (currentEarnings.total || 0) + estimatedEarnings;
      if (!currentEarnings.last7Days) currentEarnings.last7Days = [];
      const todayEntry = currentEarnings.last7Days.find((d: any) => d.day === todayShort);
      if (todayEntry) {
        todayEntry.amount += estimatedEarnings;
      } else {
        currentEarnings.last7Days.push({ day: todayShort, amount: estimatedEarnings });
      }
      localStorage.setItem('user_earnings', JSON.stringify(currentEarnings));
      
      // Clear form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVideo(null);
      setVideoPreview(null);
      
      // Notify parent - this will refresh the feed
      onTweetCreated?.(newTweet);

    } catch (error) {
      console.error('Error creating tweet:', error);
      alert('Failed to post tweet. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadingVideo(false);
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

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-64 rounded-lg border border-gray-800"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black rounded-full text-white transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Video Preview */}
          {videoPreview && (
            <div className="mt-3 relative inline-block">
              <video 
                src={videoPreview}
                className="max-h-64 rounded-lg border border-gray-800"
                controls
              />
              <button
                onClick={handleRemoveVideo}
                className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black rounded-full text-white transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          )}

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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                disabled={isLoading || hasReachedLimit || selectedVideo !== null}
              />
              <label
                htmlFor="image-upload"
                className={`p-2 text-gray-400 hover:text-[#00FFBD] hover:bg-gray-900 rounded-full transition-colors cursor-pointer ${
                  (isLoading || hasReachedLimit || selectedVideo !== null) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Add image"
              >
                <ImageIcon size={20} />
              </label>

              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                id="video-upload"
                disabled={isLoading || hasReachedLimit || selectedImage !== null}
              />
              <label
                htmlFor="video-upload"
                className={`p-2 text-gray-400 hover:text-[#00FFBD] hover:bg-gray-900 rounded-full transition-colors cursor-pointer ${
                  (isLoading || hasReachedLimit || selectedImage !== null) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Add video (max 2 min)"
              >
                <Video size={20} />
              </label>
            </div>

            <div className="flex items-center space-x-3">
              {/* Character Count - Only show when approaching limit */}
              {remainingChars < 20 && (
                <span
                  className={`text-sm font-medium ${
                    isOverLimit
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }`}
                >
                  {remainingChars}
                </span>
              )}

              {/* Tweet Button */}
              <button
                onClick={handleSubmit}
                disabled={!canTweet}
                className="bg-[#00FFBD] hover:bg-[#00E5A8] text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition-all disabled:hover:bg-[#00FFBD] shadow-[0_0_20px_rgba(0,255,189,0.3)] hover:shadow-[0_0_30px_rgba(0,255,189,0.5)]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>{uploadingVideo ? 'Uploading video...' : 'Posting...'}</span>
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
