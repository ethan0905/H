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
    if (view === "profile") {
      // Navigate to the user's profile page instead of showing UserProfile component
      if (user) {
        router.push(`/profile/${encodeURIComponent(user.id)}`)
      } else if (userId) {
        router.push(`/profile/${encodeURIComponent(userId)}`)
      }
    } else {
      setCurrentView(view)
    }
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

function CommunitiesView() {
  const { Bot, Globe, Gamepad, Film, Bitcoin, ArrowLeft, MessageCircle } = require("lucide-react")
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null)
  
  const communities = [
    {
      id: 1,
      name: "AI Agents",
      category: "Technology",
      members: 68293,
      gradient: "from-blue-500 to-cyan-500",
      description: "Discuss AI agents, automation, and the future of artificial intelligence",
      Icon: Bot,
    },
    {
      id: 2,
      name: "Human World",
      category: "Community",
      members: 124518,
      gradient: "from-green-500 to-emerald-500",
      description: "The official H World community for verified humans",
      Icon: Globe,
    },
    {
      id: 3,
      name: "Gaming",
      category: "Entertainment",
      members: 89104,
      gradient: "from-purple-500 to-pink-500",
      description: "Gaming culture, reviews, and human-created content",
      Icon: Gamepad,
    },
    {
      id: 4,
      name: "Movies",
      category: "Entertainment",
      members: 76913,
      gradient: "from-orange-500 to-red-500",
      description: "Film discussions, reviews, and recommendations by humans",
      Icon: Film,
    },
    {
      id: 5,
      name: "Bitcoin",
      category: "Finance",
      members: 95267,
      gradient: "from-yellow-500 to-orange-500",
      description: "Cryptocurrency, blockchain, and financial freedom",
      Icon: Bitcoin,
    },
  ]

  const handleJoinCommunity = (communityId: number) => {
    if (joinedCommunities.includes(communityId)) {
      // Leave community
      setJoinedCommunities(joinedCommunities.filter(id => id !== communityId))
    } else {
      // Join community - grants ability to post, comment, upvote in this community
      setJoinedCommunities([...joinedCommunities, communityId])
    }
  }

  const isJoined = (communityId: number) => joinedCommunities.includes(communityId)

  // If a community is selected, show its feed
  if (selectedCommunity) {
    const community = communities.find(c => c.id === selectedCommunity)
    if (!community) return null

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
          <div className="px-4 py-4 flex items-center gap-3">
            <button 
              onClick={() => setSelectedCommunity(null)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${community.gradient} flex items-center justify-center`}
              >
                <community.Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{community.name}</h1>
                <p className="text-xs text-gray-500">{community.members.toLocaleString()} members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Feed */}
        <div className="p-4">
          {isJoined(community.id) ? (
            <>
              {/* Compose in community */}
              <div className="bg-black border border-gray-800 rounded-lg p-4 mb-4">
                <textarea
                  placeholder={`Share in ${community.name}...`}
                  className="w-full min-h-[80px] bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 resize-none text-base p-3 focus:outline-none focus:border-[#00FFBD]/50"
                />
                <div className="flex justify-end mt-2">
                  <button className="bg-[#00FFBD] text-black font-semibold rounded-full px-6 py-2 hover:bg-[#00E5A8] transition-all">
                    Post
                  </button>
                </div>
              </div>

              {/* Mock posts */}
              <div className="space-y-4">
                <div className="bg-black border border-gray-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Human #1234</span>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Great discussion happening here! Love this community 🚀
                      </p>
                      <div className="flex items-center gap-4 text-gray-500">
                        <button className="flex items-center gap-1 hover:text-[#00FFBD] transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">5</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${community.gradient} flex items-center justify-center`}>
                <community.Icon className="w-10 h-10 text-white" />
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
        {communities.map((community) => (
          <div 
            key={community.id} 
            className="bg-black border border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-700 transition-colors"
            onClick={() => setSelectedCommunity(community.id)}
          >
            {/* Banner */}
            <div className={`h-24 bg-gradient-to-r ${community.gradient} opacity-20`} />

            {/* Content */}
            <div className="p-4 -mt-8">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${community.gradient} flex items-center justify-center mb-3 border-4 border-black`}
              >
                <community.Icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-1">{community.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{community.category}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{community.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{community.members.toLocaleString()} humans</span>
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
        ))}
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
              BEST VALUE
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Pro Creator</h3>
                <p className="text-2xl font-bold mt-2" style={{ color: "#00FFBD" }}>
                  $7.40<span className="text-sm text-gray-500">/mo</span>
                </p>
              </div>
              <button className="rounded-full font-bold text-black px-6 py-2 transition-all hover:opacity-90" style={{ backgroundColor: "#00FFBD" }}>
                Upgrade Now
              </button>
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
