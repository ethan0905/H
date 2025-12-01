"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useUserStore } from '@/store/userStore';
import TweetCard from '@/components/tweet/TweetCard';
import { Tweet } from '@/types';
import { LogOut } from 'lucide-react';

interface UserProfileProps {
  profile: any
  setProfile: (profile: any) => void
}

export function UserProfile({ profile, setProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(profile?.bio || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [activeTab, setActiveTab] = useState<'tweets' | 'likes' | 'retweets' | 'comments'>('tweets')
  const [userTweets, setUserTweets] = useState<Tweet[]>([])
  const [userLikes, setUserLikes] = useState<Tweet[]>([])
  const [userRetweets, setUserRetweets] = useState<Tweet[]>([])
  const [userComments, setUserComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user, logout } = useUserStore();

  const handleSave = () => {
    const updated = {
      ...profile,
      username,
      bio,
    }
    setProfile(updated)
    localStorage.setItem("user_profile", JSON.stringify(updated))
    setIsEditing(false)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      console.log('🚪 Logging out user...');
      logout();
      
      // Force a page reload to ensure clean state
      setTimeout(() => {
        console.log('🔄 Reloading page to show login screen...');
        window.location.href = '/';
      }, 100);
    }
  };

  if (!profile && !user) return null

  const currentProfile = profile || user;

  // Fetch user's content
  useEffect(() => {
    const fetchUserContent = async () => {
      if (!currentProfile?.id) return;
      
      setLoading(true);
      try {
        // Fetch user's tweets
        const tweetsResponse = await fetch(`/api/users/${encodeURIComponent(currentProfile.id)}/tweets`);
        if (tweetsResponse.ok) {
          const tweetsData = await tweetsResponse.json();
          setUserTweets(tweetsData.tweets || []);
        }

        // Fetch user's interactions (likes, retweets, comments)
        const interactionsResponse = await fetch(`/api/users/interactions?userId=${encodeURIComponent(currentProfile.id)}`);
        if (interactionsResponse.ok) {
          const interactionsData = await interactionsResponse.json();
          setUserLikes(interactionsData.likes || []);
          setUserRetweets(interactionsData.retweets || []);
        }

        // Fetch user's comments
        const commentsResponse = await fetch(`/api/users/${encodeURIComponent(currentProfile.id)}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setUserComments(commentsData.comments || []);
        }
      } catch (error) {
        console.error('Error fetching user content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [currentProfile?.id]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header - No back button, stays within app */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-xs text-gray-500">Your account</p>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#00FFBD]/20 to-purple-500/20 h-32 relative"></div>

      {/* Profile Content */}
      <div className="p-6 pb-4 bg-black">
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <div 
            className="w-32 h-32 rounded-full border-4 border-black flex items-center justify-center text-4xl font-bold overflow-hidden bg-gradient-to-br from-[#00FFBD] to-purple-500"
          >
            {currentProfile.avatar || currentProfile.profilePictureUrl ? (
              <img
                src={currentProfile.avatar || currentProfile.profilePictureUrl}
                alt={username || currentProfile.displayName || currentProfile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-black">
                {(username || currentProfile.displayName || currentProfile.username || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="ml-auto bg-transparent border-2 border-[#00FFBD] text-[#00FFBD] hover:bg-[#00FFBD] hover:text-black font-semibold rounded-full px-6 py-2 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-black border border-gray-800 rounded-lg text-white outline-none focus:border-[#00FFBD] focus:ring-1 focus:ring-[#00FFBD]"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-black border border-gray-800 rounded-lg text-white outline-none focus:border-[#00FFBD] focus:ring-1 focus:ring-[#00FFBD] resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSave} 
                className="bg-[#00FFBD] hover:bg-[#00E5A8] text-black font-semibold rounded-full px-6 py-2 transition-all"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="bg-transparent border border-gray-700 hover:border-gray-600 text-white rounded-full px-6 py-2 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {username || currentProfile.displayName || currentProfile.username}
                {currentProfile.isVerified && (
                  <span className="text-[#00FFBD]">✓</span>
                )}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {currentProfile.isVerified ? (
                  <span className="text-[#00FFBD]">Verified Human</span>
                ) : (
                  "User"
                )}
              </p>
            </div>
            <p className="text-gray-300 mb-4">{bio || "No bio yet."}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="font-bold text-white text-lg">{currentProfile.followers?.length || 0}</p>
                <p className="text-gray-400">Followers</p>
              </div>
              <div>
                <p className="font-bold text-white text-lg">{currentProfile.following?.length || 0}</p>
                <p className="text-gray-400">Following</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full px-6 py-2 transition-all"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </>
        )}
      </div>

      {/* Tabs Section */}
      <div className="border-t border-gray-800 bg-black">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('tweets')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'tweets'
                ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Posts ({userTweets.length})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'likes'
                ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Likes ({userLikes.length})
          </button>
          <button
            onClick={() => setActiveTab('retweets')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'retweets'
                ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Retweets ({userRetweets.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'comments'
                ? 'text-[#00FFBD] border-b-2 border-[#00FFBD]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Comments ({userComments.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFBD] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : (
            <>
              {/* Tweets Tab */}
              {activeTab === 'tweets' && (
                <div className="space-y-4">
                  {userTweets.length > 0 ? (
                    userTweets.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No posts yet</p>
                      <p className="text-sm text-gray-500 mt-2">Posts will appear here</p>
                    </div>
                  )}
                </div>
              )}

              {/* Likes Tab */}
              {activeTab === 'likes' && (
                <div className="space-y-4">
                  {userLikes.length > 0 ? (
                    userLikes.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No liked posts yet</p>
                      <p className="text-sm text-gray-500 mt-2">Liked posts will appear here</p>
                    </div>
                  )}
                </div>
              )}

              {/* Retweets Tab */}
              {activeTab === 'retweets' && (
                <div className="space-y-4">
                  {userRetweets.length > 0 ? (
                    userRetweets.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No retweets yet</p>
                      <p className="text-sm text-gray-500 mt-2">Retweeted posts will appear here</p>
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {userComments.length > 0 ? (
                    userComments.map((comment) => (
                      <div key={comment.id} className="bg-black border border-gray-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFBD] to-purple-500 flex items-center justify-center text-black font-bold">
                            {currentProfile.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300 mb-2">{comment.content}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No comments yet</p>
                      <p className="text-sm text-gray-500 mt-2">Comments will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
