"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Feed } from "@/components/layout/Feed"
import { Sidebar } from "@/components/layout/Sidebar"
import { UserProfile } from "@/components/user/UserProfile"
import { NavigationBar } from "@/components/ui/NavigationBar"
import { useUserStore } from "@/store/userStore"
import { useTweetStore } from "@/store/tweetStore"
import dynamic from 'next/dynamic'
import { Users, DollarSign, PlusCircle } from "lucide-react"

// Dynamically import the leaderboards page component
const LeaderboardsView = dynamic(() => import('@/app/leaderboards/page'), { ssr: false })

interface MainAppProps {
  userId: string | null
}

type View = "home" | "communities" | "create" | "earnings" | "profile"

export function MainApp({ userId }: MainAppProps) {
  const [currentView, setCurrentView] = useState<View>("home")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user_profile")
    if (stored) {
      setUserProfile(JSON.parse(stored))
    }
  }, [])

  const handleNavigate = (view: View) => {
    setCurrentView(view)
  }

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-black text-white overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as View)} />

      {/* Main Content - Full width on mobile, adjusted on desktop */}
      <main className="flex-1 overflow-y-auto sm:border-l sm:border-r border-gray-800 pb-16 sm:pb-0">
        {currentView === "home" && <Feed key={refreshKey} userId={userId} profile={userProfile} />}
        {currentView === "profile" && <UserProfile profile={userProfile} setProfile={setUserProfile} />}
        {currentView === "communities" && <CommunitiesView />}
        {currentView === "create" && <CreateView onPostCreated={() => {
          setCurrentView("home")
          setRefreshKey(prev => prev + 1)
        }} />}
        {currentView === "earnings" && <EarningsView key={refreshKey} />}
      </main>

      {/* Right Sidebar - Trending (Desktop only) */}
      <aside className="hidden lg:block w-72 border-l border-gray-800 p-6 overflow-y-auto bg-black">
        <h2 className="text-xl font-bold text-white mb-6">Trending</h2>
        <div className="space-y-4">
          {["Web3", "Verified Humans", "AI", "Decentralization", "Privacy"].map((tag) => (
            <div
              key={tag}
              className="p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 cursor-pointer transition border border-gray-800 hover:border-[#00FFBD]/30"
            >
              <p className="text-sm text-gray-400">Trending Worldwide</p>
              <p className="font-semibold text-white">#{tag}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <NavigationBar 
        active={currentView} 
        onNavigate={handleNavigate}
        className="sm:hidden"
      />
    </div>
  )
}

function CommunityPostCard({ post }: { post: any }) {
  const { MessageCircle, Send } = require("lucide-react")
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const { user } = useUserStore()
  const { AvatarInitial } = require("@/components/ui/AvatarInitial")

  const formatTime = (date: string | Date) => {
    const now = new Date()
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const fetchComments = async () => {
    if (commentsLoading) return
    
    setCommentsLoading(true)
    try {
      let url = `/api/tweets/${post.id}/comments`
      if (user) {
        url += `?currentUserId=${encodeURIComponent(user.id)}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentText.trim() || commentSubmitting) return

    setCommentSubmitting(true)
    try {
      const response = await fetch(`/api/tweets/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          authorId: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([...comments, data.comment])
        setCommentText('')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setCommentSubmitting(false)
    }
  }

  const handleToggleComments = () => {
    setShowComments(!showComments)
    if (!showComments && comments.length === 0) {
      fetchComments()
    }
  }

  return (
    <>
      <div className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
        <div className="flex items-start gap-3">
          <AvatarInitial
            name={post.author.displayName || post.author.username || 'User'}
            imageUrl={post.author.profilePictureUrl}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{post.author.displayName || post.author.username}</span>
              <span className="text-xs text-gray-500">{formatTime(post.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap break-words">
              {post.content}
            </p>
            <div className="flex items-center gap-4 text-gray-500">
              <button 
                onClick={handleToggleComments}
                className="flex items-center gap-1 hover:text-[#00FFBD] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{showComments ? comments.length : (post.replies || 0)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowComments(false)}
        >
          <div 
            className="bg-black border border-gray-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-black border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg sm:text-xl font-bold text-white">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
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
                    <div key={comment.id} className="flex gap-3">
                      <AvatarInitial
                        name={comment.author.displayName || comment.author.username || 'User'}
                        imageUrl={comment.author.profilePictureUrl || comment.author.avatar}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-900 rounded-2xl px-3 sm:px-4 py-3 border border-gray-800">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-semibold text-white text-sm">
                              {comment.author.displayName || comment.author.username}
                            </span>
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
              <div className="sticky bottom-0 bg-black border-t border-gray-800 px-4 sm:px-6 py-4">
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
                      className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00FFBD] focus:border-transparent bg-gray-900 text-white placeholder:text-gray-500 transition-all text-sm sm:text-base"
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
    </>
  )
}

function CommunitiesView() {
  const { Bot, Globe, Gamepad, Film, Bitcoin, ArrowLeft, MessageCircle } = require("lucide-react")
  const [communities, setCommunities] = useState<any[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [communityPosts, setCommunityPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [postSubmitting, setPostSubmitting] = useState(false)
  const { user } = useUserStore()
  
  // Icon mapping for communities
  const iconMap: { [key: string]: any } = {
    "AI Agents": Bot,
    "Human World": Globe,
    "Gaming": Gamepad,
    "Movies": Film,
    "Bitcoin": Bitcoin,
  }

  const gradientMap: { [key: string]: string } = {
    "AI Agents": "from-blue-500 to-cyan-500",
    "Human World": "from-green-500 to-emerald-500",
    "Gaming": "from-purple-500 to-pink-500",
    "Movies": "from-orange-500 to-red-500",
    "Bitcoin": "from-yellow-500 to-orange-500",
  }

  // Fetch communities from API
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const url = user ? `/api/communities?userId=${encodeURIComponent(user.id)}` : '/api/communities'
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch communities')
        const data = await response.json()
        setCommunities(data.communities || [])
      } catch (error) {
        console.error('Error fetching communities:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCommunities()
  }, [user])

  const handleJoinCommunity = async (communityId: number) => {
    if (!user) return
    
    const community = communities.find(c => c.id === communityId)
    if (!community) return

    try {
      if (community.isJoined) {
        // Leave community
        const response = await fetch('/api/communities/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ communityId, userId: user.id }),
        })
        if (!response.ok) throw new Error('Failed to leave community')
        
        // Update local state
        setCommunities(communities.map(c => 
          c.id === communityId ? { ...c, isJoined: false, memberCount: c.memberCount - 1 } : c
        ))
      } else {
        // Join community
        const response = await fetch('/api/communities/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ communityId, userId: user.id }),
        })
        if (!response.ok) throw new Error('Failed to join community')
        
        // Update local state
        setCommunities(communities.map(c => 
          c.id === communityId ? { ...c, isJoined: true, memberCount: c.memberCount + 1 } : c
        ))
      }
    } catch (error) {
      console.error('Error toggling community membership:', error)
    }
  }

  const isJoined = (communityId: number) => {
    const community = communities.find(c => c.id === communityId)
    return community?.isJoined || false
  }

  // Fetch community posts when a community is selected
  useEffect(() => {
    if (selectedCommunity && user) {
      const fetchCommunityPosts = async () => {
        setPostsLoading(true)
        try {
          const response = await fetch(`/api/communities/${selectedCommunity}/posts?userId=${encodeURIComponent(user.id)}`)
          if (response.ok) {
            const data = await response.json()
            setCommunityPosts(data.posts || [])
          }
        } catch (error) {
          console.error('Error fetching community posts:', error)
        } finally {
          setPostsLoading(false)
        }
      }
      fetchCommunityPosts()
    }
  }, [selectedCommunity, user])

  const handleCommunityPost = async () => {
    if (!user || !postContent.trim() || postSubmitting || !selectedCommunity) return

    setPostSubmitting(true)
    try {
      const response = await fetch(`/api/communities/${selectedCommunity}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent.trim(),
          authorId: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCommunityPosts([data.post, ...communityPosts])
        setPostContent('')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to post')
      }
    } catch (error) {
      console.error('Error posting to community:', error)
      alert('Failed to post. Please try again.')
    } finally {
      setPostSubmitting(false)
    }
  }

  // If a community is selected, show its feed
  if (selectedCommunity) {
    const community = communities.find(c => c.id === selectedCommunity)
    if (!community) return null

    const Icon = iconMap[community.name] || Globe
    const gradient = gradientMap[community.name] || "from-gray-500 to-gray-700"

    return (
      <div className="min-h-screen bg-black text-white pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
          <div className="px-4 py-4 flex items-center gap-3">
            <button 
              onClick={() => {
                setSelectedCommunity(null)
                setCommunityPosts([])
                setPostContent('')
              }}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{community.name}</h1>
                <p className="text-xs text-gray-500">{community.memberCount.toLocaleString()} members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Feed */}
        <div className="p-4">
          {community.isJoined ? (
            <>
              {/* Compose in community */}
              <div className="bg-black border border-gray-800 rounded-lg p-4 mb-4">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder={`Share in ${community.name}...`}
                  className="w-full min-h-[80px] bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 resize-none text-base p-3 focus:outline-none focus:border-[#00FFBD]/50"
                  maxLength={280}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{postContent.length}/280</span>
                  <button 
                    onClick={handleCommunityPost}
                    disabled={!postContent.trim() || postSubmitting}
                    className="bg-[#00FFBD] text-black font-semibold rounded-full px-6 py-2 hover:bg-[#00E5A8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {postSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>

              {/* Posts */}
              {postsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00FFBD] border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading posts...</p>
                </div>
              ) : communityPosts.length > 0 ? (
                <div className="space-y-4">
                  {communityPosts.map((post) => (
                    <CommunityPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                  <p className="text-gray-400">Be the first to share something in {community.name}!</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Join {community.name}</h3>
              <p className="text-gray-400 mb-6">Join this community to post, comment, and interact</p>
              <button 
                onClick={() => handleJoinCommunity(community.id)}
                className="bg-[#00FFBD] text-black font-semibold rounded-full px-8 py-3 hover:bg-[#00E5A8] transition-all shadow-[0_0_20px_rgba(0,255,189,0.3)]"
              >
                Join Community
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFBD] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading communities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-xs text-gray-500">Human-verified groups</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Tech", "Community", "Entertainment", "Finance"].map((cat) => (
            <button
              key={cat}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                cat === "All"
                  ? "bg-[#00FFBD] text-black"
                  : "bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Communities List */}
      <div className="px-4 space-y-4 pb-6">
        {communities.map((community) => {
          const Icon = iconMap[community.name] || Globe
          const gradient = gradientMap[community.name] || "from-gray-500 to-gray-700"
          
          return (
            <div 
              key={community.id} 
              className="bg-black border border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-700 transition-colors"
              onClick={() => setSelectedCommunity(community.id)}
            >
              {/* Banner */}
              <div className={`h-24 bg-gradient-to-r ${gradient} opacity-20`} />

              {/* Content */}
              <div className="p-4 -mt-8">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 border-4 border-black`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-1">{community.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{community.category}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{community.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{community.memberCount.toLocaleString()} humans</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleJoinCommunity(community.id)
                    }}
                    className={`font-semibold rounded-full px-6 py-2 transition-all ${
                      isJoined(community.id)
                        ? "bg-transparent border-2 border-[#00FFBD] text-[#00FFBD] hover:bg-[#00FFBD]/10"
                        : "bg-[#00FFBD] text-black hover:bg-[#00E5A8] shadow-[0_0_20px_rgba(0,255,189,0.3)]"
                    }`}
                  >
                    {isJoined(community.id) ? "Joined" : "Join"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CreateView({ onPostCreated }: { onPostCreated?: () => void }) {
  const { ImageIcon, Video, Type, TrendingUp } = require("lucide-react")
  const { user } = useUserStore()
  const { addTweet } = useTweetStore()
  const [content, setContent] = useState("")
  const [selectedType, setSelectedType] = useState<"text" | "image" | "video">("text")
  const [isPosting, setIsPosting] = useState(false)

  const estimatedEarnings = Math.min(content.length * 0.05, 50)

  const handlePost = async () => {
    if (!content.trim() || !user || isPosting) return

    try {
      setIsPosting(true)

      // Create tweet data
      const tweetData = {
        content: content.trim(),
        userId: user.id,
      }

      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetData),
      })

      if (!response.ok) {
        throw new Error('Failed to create tweet')
      }

      const newTweet = await response.json()
      
      // Add to store
      addTweet(newTweet)
      
      // Store earnings data
      const currentEarnings = JSON.parse(localStorage.getItem('user_earnings') || '{"total": 0, "last7Days": []}')
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
      
      currentEarnings.total = (currentEarnings.total || 0) + estimatedEarnings
      if (!currentEarnings.last7Days) currentEarnings.last7Days = []
      
      const todayEntry = currentEarnings.last7Days.find((d: any) => d.day === today)
      if (todayEntry) {
        todayEntry.amount += estimatedEarnings
      } else {
        currentEarnings.last7Days.push({ day: today, amount: estimatedEarnings })
      }
      
      localStorage.setItem('user_earnings', JSON.stringify(currentEarnings))
      
      // Clear form and redirect
      setContent('')
      onPostCreated?.()

    } catch (error) {
      console.error('Error creating tweet:', error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create</h1>
          <button
            onClick={handlePost}
            disabled={!content.trim() || isPosting}
            className="text-black font-bold rounded-full px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: "#00FFBD" }}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="px-4 py-6 border-b border-gray-900">
        <p className="text-sm text-gray-400 mb-3">Content Type</p>
        <div className="grid grid-cols-3 gap-3">
          <button
            className={`flex flex-col items-center gap-2 h-20 rounded-lg border-2 transition-all ${
              selectedType === "text" 
                ? "text-black border-[#00FFBD]" 
                : "border-gray-800 hover:border-gray-600 bg-transparent"
            }`}
            style={selectedType === "text" ? { backgroundColor: "#00FFBD" } : undefined}
            onClick={() => setSelectedType("text")}
          >
            <Type className="w-5 h-5" />
            <span className="text-xs font-semibold">Text</span>
          </button>
          <button
            className={`flex flex-col items-center gap-2 h-20 rounded-lg border-2 transition-all ${
              selectedType === "image" 
                ? "text-black border-[#00FFBD]" 
                : "border-gray-800 hover:border-gray-600 bg-transparent"
            }`}
            style={selectedType === "image" ? { backgroundColor: "#00FFBD" } : undefined}
            onClick={() => setSelectedType("image")}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs font-semibold">Image</span>
          </button>
          <button
            className={`flex flex-col items-center gap-2 h-20 rounded-lg border-2 transition-all ${
              selectedType === "video" 
                ? "text-black border-[#00FFBD]" 
                : "border-gray-800 hover:border-gray-600 bg-transparent"
            }`}
            style={selectedType === "video" ? { backgroundColor: "#00FFBD" } : undefined}
            onClick={() => setSelectedType("video")}
          >
            <Video className="w-5 h-5" />
            <span className="text-xs font-semibold">Video</span>
          </button>
        </div>
      </div>

      {/* Content Input */}
      <div className="px-4 py-6">
        <textarea
          placeholder="Share your human perspective..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[200px] bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 resize-none text-base p-4 focus:outline-none focus:border-[#00FFBD]/50"
        />
      </div>

      {/* Estimated Earnings */}
      <div className="mx-4 mb-6">
        <div className="border rounded-2xl p-6" style={{ backgroundColor: "#00FFBD10", borderColor: "#00FFBD30" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: "#00FFBD" }} />
              <span className="text-sm font-semibold text-gray-300">Estimated Earnings</span>
            </div>
          </div>

          {/* Earnings Meter */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold" style={{ color: "#00FFBD" }}>
                ${estimatedEarnings.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">per 1000 views</span>
            </div>

            <div className="relative h-3 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((estimatedEarnings / 50) * 100, 100)}%`, backgroundColor: "#00FFBD" }}
              />
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Based on engagement, content quality, and your creator tier
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mx-4 mb-6 bg-black border border-gray-800 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">💡 Maximize Your Earnings</h3>
        <ul className="space-y-2 text-xs text-gray-400">
          <li className="flex items-start gap-2">
            <span style={{ color: "#00FFBD" }}>•</span>
            <span>Longer, high-quality content earns more</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: "#00FFBD" }}>•</span>
            <span>Engagement (likes, comments) boosts earnings</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: "#00FFBD" }}>•</span>
            <span>Human-created content only - authenticity pays</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function EarningsView() {
  const { TrendingUp, Award, Zap, Trophy, Star, Info, Check } = require("lucide-react")
  const { user } = useUserStore()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'pro'>('free')
  
  // Load earnings from localStorage
  const storedEarnings = JSON.parse(localStorage.getItem('user_earnings') || '{"total": 0, "last7Days": []}')
  
  // Initialize 7 days with stored data
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const earningsData = daysOfWeek.map(day => {
    const stored = storedEarnings.last7Days?.find((d: any) => d.day === day)
    return { day, amount: stored?.amount || 0 }
  })

  // Calculate totals based on last 7 days
  const weekEarnings = earningsData.reduce((sum, day) => sum + day.amount, 0)
  // Projected monthly = (weekly average) * 30 days
  const projectedMonthly = weekEarnings > 0 ? (weekEarnings / 7) * 30 : 0
  const totalEarnings = storedEarnings.total || 0

  const badges = [
    { icon: Trophy, label: "1000 Likes", colorClass: "from-yellow-500 to-orange-500" },
    { icon: Star, label: "First Payment", bgColor: "#00FFBD" },
    { icon: Zap, label: "Elite Tier", colorClass: "from-purple-500 to-pink-500" },
  ]

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return
      try {
        const response = await fetch(`/api/subscriptions/status?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setSubscriptionStatus(data.plan || 'free')
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      }
    }
    checkSubscription()
  }, [user])

  const handleUpgradeToPro = async () => {
    if (!user || isUpgrading) return
    
    setIsUpgrading(true)
    try {
      // Step 1: Call the upgrade API to initiate payment intent
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate upgrade')
      }

      const { paymentIntentId } = await response.json()
      
      // Step 2: Import and use World Pay
      const { initiateWorldPayment, generatePaymentReference } = await import('@/lib/worldpay')
      const { MiniKit } = await import('@worldcoin/minikit-js')
      
      // Check if running in World App
      if (!MiniKit.isInstalled()) {
        alert('⚠️ World App Required\n\nTo complete your Pro subscription, please open this app in World App.\n\nPayment Intent: ' + paymentIntentId)
        return
      }
      
      // Step 3: Generate unique payment reference
      const paymentReference = generatePaymentReference(user.id, 'pro_subscription')
      
      // Step 4: Initiate World Pay payment
      const paymentResult = await initiateWorldPayment(
        7.40, // $7.40/month
        'H World Pro Subscription - Monthly',
        paymentReference
      )
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed')
      }
      
      // Step 5: Confirm payment on backend
      const confirmResponse = await fetch('/api/subscriptions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          paymentIntentId,
          transactionId: paymentResult.transactionId,
        }),
      })
      
      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm subscription')
      }
      
      // Step 6: Update UI
      setSubscriptionStatus('pro')
      alert('🎉 Welcome to Pro!\n\nYour subscription is now active. Enjoy unlimited posts, lower fees, and exclusive features!')
      
    } catch (error) {
      console.error('Error upgrading to Pro:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert('❌ Upgrade Failed\n\n' + errorMessage)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-xs text-gray-500">Your creator dashboard</p>
        </div>
      </div>

      {/* Total Earnings Card */}
      <div className="px-4 py-4">
        <div className="rounded-3xl p-6 shadow-[0_0_30px_rgba(0,255,189,0.4)]" style={{ backgroundColor: "#00FFBD" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-black/70">Total Earnings</span>
            <DollarSign className="w-5 h-5 text-black" />
          </div>
          <div className="text-5xl font-bold mb-1 text-black">
            ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-sm text-black/70">
            <TrendingUp className="w-4 h-4" />
            <span>Start creating to earn</span>
          </div>
        </div>
      </div>

      {/* Week and Projected Stats */}
      <div className="px-4 grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">This Week</p>
          <p className="text-2xl font-bold" style={{ color: "#00FFBD" }}>
            ${weekEarnings.toFixed(2)}
          </p>
        </div>
        <div className="bg-black border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Projected Monthly</p>
          <p className="text-2xl font-bold" style={{ color: "#00FFBD" }}>
            ${projectedMonthly.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Last 7 Days Chart */}
      <div className="px-4 mb-6">
        <div className="bg-black border border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold mb-4">Last 7 Days</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {earningsData.map((day, index) => {
              const maxAmount = Math.max(...earningsData.map(d => d.amount), 1)
              const height = day.amount > 0 ? Math.max((day.amount / maxAmount) * 100, 10) : 10
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-full relative group">
                    <div
                      className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height}%`, backgroundColor: day.amount > 0 ? "#00FFBD" : "#1F2937" }}
                    />
                    {/* Tooltip */}
                    {day.amount > 0 && (
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black border border-gray-700 rounded px-2 py-1 text-xs whitespace-nowrap">
                        ${day.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Creator Rank Progress */}
      <div className="px-4 mb-6">
        <div className="bg-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold mb-1">Creator Rank</h3>
              <p className="text-xs text-gray-500">Level up to earn more per post</p>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-purple-400">Starter</span>
              <span className="text-gray-500">Next: Elite</span>
            </div>

            <div className="relative h-3 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: "0%", backgroundColor: "#00FFBD" }}
              />
            </div>

            <p className="text-xs text-gray-500">0 / 100 engagement points to Elite tier</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 mb-6">
        <div className="bg-black border border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold mb-4">Achievements</h3>
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center gap-2 opacity-40">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    badge.colorClass ? `bg-gradient-to-br ${badge.colorClass}` : ""
                  }`}
                  style={badge.bgColor ? { backgroundColor: badge.bgColor } : undefined}
                >
                  <badge.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-center text-gray-400">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connected Wallet & Withdraw */}
      <div className="px-4 mb-6">
        <div className="border rounded-2xl p-6" style={{ backgroundColor: "#00FFBD20", borderColor: "#00FFBD80" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold mb-1">Connected Wallet</h3>
              <p className="text-xs text-gray-500 font-mono">Not connected</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#00FFBD20" }}
            >
              <DollarSign className="w-5 h-5" style={{ color: "#00FFBD" }} />
            </div>
          </div>
          <button
            className="w-full text-black font-bold rounded-full py-4"
            style={{ backgroundColor: "#00FFBD" }}
          >
            Connect Wallet to Withdraw
          </button>
        </div>
      </div>

      {/* How it Works */}
      <div className="px-4 mb-6">
        <div className="bg-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#00FFBD20" }}
            >
              <Info className="w-5 h-5" style={{ color: "#00FFBD" }} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold mb-2">How Creator Revenue Works</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">
                All creator earnings on H World are funded by platform sponsors and advertisers. Your content generates
                real value, and we ensure you're rewarded for it.
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <span className="font-semibold" style={{ color: "#00FFBD" }}>
                  Early Active Users:
                </span>{" "}
                Join the H World ecosystem early to earn exclusive badges that permanently increase your earnings
                multiplier. The sooner you contribute quality content, the higher your ROI on every post in the future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Plans Section */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold mb-4">Creator Plans</h2>
        <div className="grid gap-4">
          {/* Free Plan */}
          <div className="bg-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-2xl font-bold mt-2">
                  $0<span className="text-sm text-gray-500">/mo</span>
                </p>
              </div>
              <button className="border-2 border-gray-700 hover:border-gray-600 bg-transparent rounded-full px-6 py-2 text-sm font-semibold transition-colors">
                Current Plan
              </button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">10 posts per day</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">280 characters per post</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">20% withdrawal fees</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">Basic analytics</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-black border-2 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,255,189,0.3)]" style={{ borderColor: "#00FFBD" }}>
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-black border-2"
              style={{ color: "#00FFBD", borderColor: "#00FFBD" }}
            >
              {subscriptionStatus === 'pro' ? 'CURRENT PLAN' : 'BEST VALUE'}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Pro Creator</h3>
                <p className="text-2xl font-bold mt-2" style={{ color: "#00FFBD" }}>
                  $7.40<span className="text-sm text-gray-500">/mo</span>
                </p>
              </div>
              {subscriptionStatus === 'pro' ? (
                <button className="border-2 rounded-full px-6 py-2 text-sm font-semibold" style={{ borderColor: "#00FFBD", color: "#00FFBD" }}>
                  Active
                </button>
              ) : (
                <button 
                  onClick={handleUpgradeToPro}
                  disabled={isUpgrading}
                  className="rounded-full font-bold text-black px-6 py-2 transition-all hover:opacity-90 disabled:opacity-50" 
                  style={{ backgroundColor: "#00FFBD" }}
                >
                  {isUpgrading ? 'Processing...' : 'Upgrade Now'}
                </button>
              )}
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    Unlimited
                  </span>{" "}
                  content publishing
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    1000 characters
                  </span>{" "}
                  per post
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    5% withdrawal fees
                  </span>{" "}
                  (75% savings)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    Season 1 Human Badge
                  </span>{" "}
                  (unique & permanent)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">Priority support & advanced analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">Early access to new features</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
