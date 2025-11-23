'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Tweet } from '@/types';
import { useUserStore } from '@/store/userStore';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import TweetCard from '@/components/tweet/TweetCard';
import EditProfileModal from '@/components/EditProfileModal';

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
  const [activeTab, setActiveTab] = useState<'tweets' | 'likes' | 'retweets' | 'comments'>('tweets');
  const [loading, setLoading] = useState(true);
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

  // Get liked tweets
  const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);
  const [retweetedTweets, setRetweetedTweets] = useState<Tweet[]>([]);
  const [commentedTweets, setCommentedTweets] = useState<Tweet[]>([]);

  const fetchLikedTweets = async () => {
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
    }
  };

  const fetchRetweetedTweets = async () => {
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
    }
  };

  const getLikedTweets = () => likedTweets;
  const getRetweetedTweets = () => retweetedTweets;
  const getCommentedTweets = () => commentedTweets;

  const fetchCommentedTweets = async () => {
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

  const handleProfileUpdate = (updatedData: { displayName: string; username: string; bio: string }) => {
    if (profileUser) {
      // Update the local profile user state
      const updatedProfileUser = {
        ...profileUser,
        displayName: updatedData.displayName,
        username: updatedData.username,
        bio: updatedData.bio,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Don't show "user not found" - we can always create a profile for any user
  if (!profileUser) {
    console.log('Profile component: profileUser still null after useEffect');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-full hover:bg-muted text-foreground"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <p className="text-sm text-muted-foreground">{userStats.tweetsCount} tweets</p>
              </div>
            </div>
            
            {/* Edit Profile / Follow/Unfollow Button */}
            {currentUser && (
              isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 rounded-full font-semibold text-sm transition-colors border-2 border-brand text-brand hover:bg-brand hover:text-black"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                    isFollowing
                      ? 'bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground'
                      : 'bg-brand text-black hover:bg-brand-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )
            )}
          </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Profile Info */}
        <div className="bg-card">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-brand-900 to-brand-700"></div>
          
          {/* Profile Details */}
          <div className="px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div 
                className="w-32 h-32 rounded-full border-4 border-background flex items-center justify-center text-4xl font-bold overflow-hidden"
                style={{
                  backgroundColor: profileUser.profilePictureUrl || profileUser.avatar ? 'transparent' : '#000000',
                  color: '#FFFFFF',
                  border: profileUser.profilePictureUrl || profileUser.avatar ? '4px solid hsl(var(--background))' : '4px solid #A2A2A2'
                }}
              >
                {profileUser.profilePictureUrl || profileUser.avatar ? (
                  <img
                    src={profileUser.profilePictureUrl || profileUser.avatar}
                    alt={profileUser.displayName || profileUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profileUser.displayName || profileUser.username || 'U').charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Name and Verification */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <VerifiedBadge 
                  user={profileUser} 
                  worldIdVerification={isOwnProfile ? worldIdVerification : null}
                  size="md"
                />
              </div>
              <p className="text-muted-foreground">@{profileUser.username}</p>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div className="mb-4">
                <p className="text-foreground">{profileUser.bio}</p>
              </div>
            )}

            {/* Join Date */}
            <div className="mb-4">
              <p className="text-muted-foreground text-sm">
                📅 Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 mb-4">
              <div>
                <span className="font-bold text-foreground">{userStats.followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold text-foreground">{userStats.followersCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-foreground">{userStats.likesCount}</span>
                <span className="text-muted-foreground ml-1">Likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card border-b border-border sticky top-16 z-40">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tweets')}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === 'tweets'
                  ? 'text-brand border-b-2 border-brand font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tweets ({userStats.tweetsCount})
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === 'likes'
                  ? 'text-brand border-b-2 border-brand font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Likes ({userStats.likesCount})
            </button>
            <button
              onClick={() => setActiveTab('retweets')}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === 'retweets'
                  ? 'text-brand border-b-2 border-brand font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Retweets ({userStats.retweetsCount})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === 'comments'
                  ? 'text-brand border-b-2 border-brand font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Comments ({userStats.commentsCount})
            </button>
          </div>
        </div>

        {/* Tweet Feed */}
        <div className="bg-background min-h-screen">
          {getDisplayTweets().length === 0 ? (
            <div className="bg-card p-8 text-center">
              <p className="text-muted-foreground">
                {activeTab === 'tweets' && 'No tweets yet'}
                {activeTab === 'likes' && 'No liked tweets'}
                {activeTab === 'retweets' && 'No retweets'}
                {activeTab === 'comments' && 'No commented tweets'}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {getDisplayTweets().map((tweet) => (
                <div key={tweet.id} className="border-b border-border last:border-b-0">
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
