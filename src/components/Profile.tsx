'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Tweet } from '@/types';
import { useUserStore } from '@/store/userStore';
import TweetCard from '@/components/tweet/TweetCard';
import EditProfileModal from '@/components/EditProfileModal';
import { RankBadge } from '@/components/gamification/RankBadge';
import { RankProgress } from '@/components/gamification/RankProgress';
import { TagsDisplay } from '@/components/gamification/TagsDisplay';
import { AvatarInitial } from '@/components/ui/AvatarInitial';
import { SeasonOneBadge } from '@/components/ui/SeasonOneBadge';
import { StreakDisplay } from '@/components/ui/StreakDisplay';
import { ArrowLeft } from 'lucide-react';

interface ProfileProps {
  userId: string;
  user?: User;
}

interface UserStats {
  tweetsCount: number;
  likesCount: number;
  retweetsCount: number;
  followersCount: number;
  followingCount: number;
  commentsCount: number;
}

interface GamificationData {
  rank: {
    current: string;
    currentDisplayName: string;
    score: number;
    progress?: {
      currentRank: string;
      nextRank: string | null;
      currentScore: number;
      requiredScore: number;
      progressPercentage: number;
    };
  };
  tags: Array<{
    id: string;
    name: string;
    description: string | null;
    isLimited: boolean;
    grantedAt: string;
  }>;
  stats: {
    streakDays: number;
    contributionScore: number;
    engagementScore: number;
  };
}

export default function Profile({ userId, user: initialUser }: ProfileProps) {
  const router = useRouter();
  const { user: currentUser, worldIdVerification } = useUserStore();
  
  console.log('Profile component props:', { userId, initialUser, currentUser });
  const [profileUser, setProfileUser] = useState<User | null>(initialUser || null);
  const [userTweets, setUserTweets] = useState<Tweet[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    tweetsCount: 0,
    likesCount: 0,
    retweetsCount: 0,
    followersCount: 0,
    followingCount: 0,
    commentsCount: 0
  });
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tweets' | 'likes' | 'retweets' | 'comments'>('tweets');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    console.log('Profile useEffect: Setting up profile user', { userId, profileUser, initialUser });
    
    // If we don't have the user data, fetch it from the API
    if (!profileUser) {
      const fetchUser = async () => {
        try {
          console.log('Profile: Fetching user data for:', userId);
          const response = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('Profile: Found user data:', userData);
            setProfileUser({
              id: userData.id,
              username: userData.username,
              displayName: userData.displayName,
              bio: userData.bio,
              avatar: userData.avatar,
              profilePictureUrl: userData.profilePictureUrl,
              isVerified: userData.isVerified,
              createdAt: userData.createdAt,
              worldcoinId: userData.worldcoinId,
              walletAddress: userData.walletAddress,
              isSeasonOneOG: userData.isSeasonOneOG,
            });
            
            // Set user stats from API response
            if (userData.stats) {
              setUserStats({
                tweetsCount: userData.stats.tweetsCount,
                likesCount: userData.stats.likesCount,
                retweetsCount: userData.stats.retweetsCount,
                followersCount: userData.stats.followersCount,
                followingCount: userData.stats.followingCount,
                commentsCount: userData.stats.commentsCount || 0,
              });
            }
            
            // Check if current user is following this profile user
            if (currentUser && currentUser.id !== userId) {
              setIsFollowing(userData.isFollowing || false);
            }
          } else if (response.status === 404) {
            console.log('Profile: User not found in database, creating mock user');
            // Create a mock user if not found in database
            const isWorldIdUser = userId.startsWith('0x') && userId.length > 20;
            const isWalletUser = userId.startsWith('0x') && userId.length <= 20;
            
            const mockUser = {
              id: userId,
              username: isWorldIdUser 
                ? `human_${userId.slice(-8)}` 
                : isWalletUser 
                  ? `user_${userId.slice(-8)}`
                  : userId.startsWith('user') ? userId : `user_${userId}`,
              displayName: isWorldIdUser 
                ? 'Verified Human' 
                : isWalletUser 
                  ? 'World User'
                  : userId.startsWith('user') ? userId.charAt(0).toUpperCase() + userId.slice(1) : 'User',
              bio: isWorldIdUser 
                ? 'Verified human on World ID' 
                : isWalletUser 
                  ? 'World App user'
                  : 'User profile',
              avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${userId}`,
              profilePictureUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${userId}`,
              isVerified: isWorldIdUser || ['user1', 'user2', 'user3'].includes(userId),
              walletAddress: isWalletUser ? userId : undefined,
              createdAt: new Date(),
            };
            setProfileUser(mockUser);
          }
        } catch (error) {
          console.error('Profile: Error fetching user:', error);
          // Still create a mock user on error
          const mockUser = {
            id: userId,
            username: userId.startsWith('user') ? userId : `user_${userId}`,
            displayName: userId.startsWith('user') ? userId.charAt(0).toUpperCase() + userId.slice(1) : 'User',
            bio: 'User profile',
            avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${userId}`,
            profilePictureUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${userId}`,
            isVerified: false,
            createdAt: new Date(),
          };
          setProfileUser(mockUser);
        }
      };
      
      fetchUser();
    }

    // Fetch user tweets from API
    const fetchUserTweets = async () => {
      setTabLoading(true);
      try {
        console.log('Profile: Fetching tweets for user:', userId);
        let url = `/api/users/${encodeURIComponent(userId)}/tweets?type=tweets`;
        if (currentUser) {
          url += `&currentUserId=${encodeURIComponent(currentUser.id)}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile: Loaded user tweets:', data.tweets.length);
          setUserTweets(data.tweets);
        } else {
          console.log('Profile: No tweets found for user');
          setUserTweets([]);
        }
      } catch (error) {
        console.error('Profile: Error fetching user tweets:', error);
        setUserTweets([]);
      } finally {
        setTabLoading(false);
      }
    };

    if (profileUser) {
      fetchUserTweets();
    }
    
    setLoading(false);
  }, [userId, profileUser]);

  // Always fetch fresh stats from API (including for own profile)
  useEffect(() => {
    const fetchFreshStats = async () => {
      try {
        let url = `/api/users?userId=${encodeURIComponent(userId)}`;
        if (currentUser) {
          url += `&currentUserId=${encodeURIComponent(currentUser.id)}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const userData = await response.json();
          if (userData.stats) {
            setUserStats({
              tweetsCount: userData.stats.tweetsCount,
              likesCount: userData.stats.likesCount,
              retweetsCount: userData.stats.retweetsCount,
              followersCount: userData.stats.followersCount,
              followingCount: userData.stats.followingCount,
              commentsCount: userData.stats.commentsCount || 0,
            });
          }
          
          // Check if current user is following this profile user
          if (currentUser && currentUser.id !== userId) {
            setIsFollowing(userData.isFollowing || false);
          }
        }
      } catch (error) {
        console.error('Error fetching fresh stats:', error);
      }
    };

    fetchFreshStats();
  }, [userId, currentUser]);

  // Fetch gamification data
  useEffect(() => {
    const fetchGamificationData = async () => {
      if (!userId) return;
      
      setGamificationLoading(true);
      try {
        const response = await fetch(`/api/gamification/user/${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          setGamificationData(data);
        } else {
          console.log('No gamification data available for user');
        }
      } catch (error) {
        console.error('Error fetching gamification data:', error);
      } finally {
        setGamificationLoading(false);
      }
    };

    fetchGamificationData();
  }, [userId]);

  // Get liked tweets
  const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);
  const [retweetedTweets, setRetweetedTweets] = useState<Tweet[]>([]);
  const [commentedTweets, setCommentedTweets] = useState<Tweet[]>([]);

  const fetchLikedTweets = async () => {
    setTabLoading(true);
    try {
      let url = `/api/users/${encodeURIComponent(userId)}/tweets?type=likes`;
      if (currentUser) {
        url += `&currentUserId=${encodeURIComponent(currentUser.id)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLikedTweets(data.tweets);
      }
    } catch (error) {
      console.error('Error fetching liked tweets:', error);
      setLikedTweets([]);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchRetweetedTweets = async () => {
    setTabLoading(true);
    try {
      let url = `/api/users/${encodeURIComponent(userId)}/tweets?type=retweets`;
      if (currentUser) {
        url += `&currentUserId=${encodeURIComponent(currentUser.id)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRetweetedTweets(data.tweets);
      }
    } catch (error) {
      console.error('Error fetching retweeted tweets:', error);
      setRetweetedTweets([]);
    } finally {
      setTabLoading(false);
    }
  };

  const getLikedTweets = () => likedTweets;
  const getRetweetedTweets = () => retweetedTweets;
  const getCommentedTweets = () => commentedTweets;

  const fetchCommentedTweets = async () => {
    setTabLoading(true);
    try {
      let url = `/api/users/${encodeURIComponent(userId)}/comments`;
      if (currentUser) {
        url += `?currentUserId=${encodeURIComponent(currentUser.id)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCommentedTweets(data.tweets);
      }
    } catch (error) {
      console.error('Error fetching commented tweets:', error);
      setCommentedTweets([]);
    } finally {
      setTabLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser || followLoading) return;
    
    setFollowLoading(true);
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: currentUser.id,
          followingId: profileUser.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsFollowing(result.isFollowing);
        
        // Update follower count optimistically
        setUserStats(prev => ({
          ...prev,
          followersCount: result.isFollowing 
            ? prev.followersCount + 1 
            : prev.followersCount - 1
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdate = (updatedData: { displayName: string; username: string; bio: string; profilePictureUrl?: string }) => {
    if (profileUser) {
      // Update the local profile user state
      const updatedProfileUser = {
        ...profileUser,
        displayName: updatedData.displayName,
        username: updatedData.username,
        bio: updatedData.bio,
        ...(updatedData.profilePictureUrl && { 
          profilePictureUrl: updatedData.profilePictureUrl,
          avatar: updatedData.profilePictureUrl 
        }),
      };
      setProfileUser(updatedProfileUser);

      // If this is the current user's own profile, update the user store as well
      if (currentUser && currentUser.id === userId) {
        const { updateUser } = useUserStore.getState();
        updateUser(updatedProfileUser);
      }
    }
  };

  // Fetch tweets based on active tab
  useEffect(() => {
    if (!profileUser) return;
    
    if (activeTab === 'likes' && likedTweets.length === 0) {
      fetchLikedTweets();
    } else if (activeTab === 'retweets' && retweetedTweets.length === 0) {
      fetchRetweetedTweets();
    } else if (activeTab === 'comments' && commentedTweets.length === 0) {
      fetchCommentedTweets();
    }
  }, [activeTab, profileUser, likedTweets.length, retweetedTweets.length, commentedTweets.length]);

  const getDisplayTweets = () => {
    switch (activeTab) {
      case 'likes':
        return getLikedTweets();
      case 'retweets':
        return getRetweetedTweets();
      case 'comments':
        return getCommentedTweets();
      default:
        return userTweets;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#00FFBD] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Don't show "user not found" - we can always create a profile for any user
  if (!profileUser) {
    console.log('Profile component: profileUser still null after useEffect');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#00FFBD] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-gray-900 text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profileUser.displayName || profileUser.username}
              </h1>
              <p className="text-sm text-gray-400">{userStats.tweetsCount} tweets</p>
            </div>
          </div>
          
          {/* Edit Profile / Follow/Unfollow Button */}
          {currentUser && (
            isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 border-[#00FFBD] text-[#00FFBD] hover:bg-[#00FFBD] hover:text-black"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isFollowing
                    ? 'bg-gray-800 text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500 border border-gray-700'
                    : 'bg-[#00FFBD] text-black hover:bg-[#00E5A8] shadow-[0_0_20px_rgba(0,255,189,0.3)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )
          )}
        </div>
      </header>

      <main className="w-full sm:max-w-2xl sm:mx-auto">
        {/* Profile Info */}
        <div className="bg-black">
          {/* Cover Photo - Gradient with cyan accent */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-gray-900 via-black to-[#00FFBD]/20 border-b border-gray-800"></div>
          
          {/* Profile Details */}
          <div className="px-3 sm:px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-12 sm:-mt-16 mb-3 sm:mb-4">
              <AvatarInitial 
                name={profileUser.displayName || profileUser.username || 'U'}
                imageUrl={profileUser.profilePictureUrl || profileUser.avatar}
                size="xl"
                className="border-4 border-black"
              />
            </div>

            {/* Name and Verification */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {profileUser.displayName || profileUser.username}
                </h1>
              </div>
              <p className="text-sm text-gray-400">@{profileUser.username}</p>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div className="mb-3 sm:mb-4">
                <p className="text-sm sm:text-base text-gray-300">{profileUser.bio}</p>
              </div>
            )}

            {/* Season 1 OG Badge */}
            {profileUser.isSeasonOneOG && (
              <div className="mb-4">
                <SeasonOneBadge size="md" showLabel={true} />
              </div>
            )}

            {/* Gamification Section */}
            {!gamificationLoading && gamificationData && (
              <div className="mb-4 space-y-3">
                {/* Rank Badge & Streak */}
                <div className="flex items-center justify-between space-x-3">
                  <RankBadge 
                    rank={gamificationData.rank.current as any}
                    size="md"
                    showLabel={true}
                  />
                  <StreakDisplay
                    currentStreak={gamificationData.stats.streakDays}
                    size="md"
                    isActive={true}
                  />
                </div>

                {/* Progress Bar */}
                {gamificationData.rank.progress && (
                  <div className="space-y-1">
                    <RankProgress 
                      currentRank={gamificationData.rank.progress.currentRank as any}
                      nextRank={gamificationData.rank.progress.nextRank as any}
                      progressToNext={gamificationData.rank.progress.progressPercentage / 100}
                      rankScore={gamificationData.rank.score}
                    />
                  </div>
                )}

                {/* Tags Display */}
                {gamificationData.tags.length > 0 && (
                  <TagsDisplay 
                    tags={gamificationData.tags.map(tag => ({
                      ...tag,
                      description: tag.description || undefined
                    }))}
                    maxDisplay={5}
                  />
                )}
              </div>
            )}

            {/* Join Date */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm">
                📅 Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 mb-4">
              <div>
                <span className="font-bold text-white">{userStats.followingCount}</span>
                <span className="text-gray-400 ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold text-white">{userStats.followersCount}</span>
                <span className="text-gray-400 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-white">{userStats.likesCount}</span>
                <span className="text-gray-400 ml-1">Likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black border-b border-gray-800 sticky top-16 z-40">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tweets')}
              className={`flex-1 py-4 text-center transition-colors text-sm font-medium ${
                activeTab === 'tweets'
                  ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tweets ({userStats.tweetsCount})
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-4 text-center transition-colors text-sm font-medium ${
                activeTab === 'likes'
                  ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Likes ({userStats.likesCount})
            </button>
            <button
              onClick={() => setActiveTab('retweets')}
              className={`flex-1 py-4 text-center transition-colors text-sm font-medium ${
                activeTab === 'retweets'
                  ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Retweets ({userStats.retweetsCount})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-4 text-center transition-colors text-sm font-medium ${
                activeTab === 'comments'
                  ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Comments ({userStats.commentsCount})
            </button>
          </div>
        </div>

        {/* Tweet Feed */}
        <div className="bg-black min-h-screen">
          {tabLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse border-b border-gray-800">
                  <div className="flex space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-800 rounded w-1/4 mb-2"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-800 rounded"></div>
                        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : getDisplayTweets().length === 0 ? (
            <div className="bg-black p-12 text-center border-b border-gray-800">
              <div className="text-6xl mb-4">
                {activeTab === 'tweets' && '📝'}
                {activeTab === 'likes' && '❤️'}
                {activeTab === 'retweets' && '🔁'}
                {activeTab === 'comments' && '💬'}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'tweets' && 'No tweets yet'}
                {activeTab === 'likes' && 'No liked tweets'}
                {activeTab === 'retweets' && 'No retweets'}
                {activeTab === 'comments' && 'No commented tweets'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'tweets' && 'Start sharing your thoughts with the world.'}
                {activeTab === 'likes' && 'Liked tweets will appear here.'}
                {activeTab === 'retweets' && 'Retweeted posts will appear here.'}
                {activeTab === 'comments' && 'Commented tweets will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {getDisplayTweets().map((tweet) => (
                <div key={tweet.id} className="border-b border-gray-800 last:border-b-0">
                  <TweetCard tweet={tweet} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {profileUser && (
        <EditProfileModal
          user={profileUser}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}
