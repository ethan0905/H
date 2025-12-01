"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Feed } from "@/components/layout/Feed"
import { Sidebar } from "@/components/layout/Sidebar"
import { UserProfile } from "@/components/user/UserProfile"
import { NavigationBar } from "@/components/ui/NavigationBar"
import { useUserStore } from "@/store/userStore"
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
        {currentView === "home" && <Feed userId={userId} profile={userProfile} />}
        {currentView === "profile" && <UserProfile profile={userProfile} setProfile={setUserProfile} />}
        {currentView === "communities" && <CommunitiesView />}
        {currentView === "create" && <CreateView />}
        {currentView === "earnings" && <EarningsView />}
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
  const { Bot, Globe, Gamepad, Film, Bitcoin } = require("lucide-react")
  
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
          <div key={community.id} className="bg-black border border-gray-800 rounded-2xl overflow-hidden">
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
                <button className="bg-[#00FFBD] text-black font-semibold rounded-full px-6 py-2 hover:bg-[#00E5A8] transition-all shadow-[0_0_20px_rgba(0,255,189,0.3)]">
                  Join
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CreateView() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <PlusCircle className="w-8 h-8 text-[#00FFBD]" />
        <h1 className="text-2xl sm:text-3xl font-bold">Create</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "New Post", description: "Share your thoughts", icon: "📝" },
          { title: "Start Community", description: "Build your tribe", icon: "👥" },
          { title: "Create Poll", description: "Get opinions", icon: "📊" },
          { title: "Host Event", description: "Bring people together", icon: "📅" },
        ].map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-[#00FFBD]/30 transition cursor-pointer"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <p className="text-lg font-semibold text-white mb-1">{item.title}</p>
            <p className="text-sm text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EarningsView() {
  const { TrendingUp, Award, Zap, Trophy, Star, Info, Check } = require("lucide-react")
  
  const totalEarnings = 0
  const weekEarnings = 0
  const projectedMonthly = 0

  const earningsData = [
    { day: "Mon", amount: 0 },
    { day: "Tue", amount: 0 },
    { day: "Wed", amount: 0 },
    { day: "Thu", amount: 0 },
    { day: "Fri", amount: 0 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 },
  ]

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
            {earningsData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: "20%", backgroundColor: "#00FFBD" }}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
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
    </div>
  )
}
