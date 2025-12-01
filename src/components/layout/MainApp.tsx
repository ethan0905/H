"use client"

import { useState, useEffect } from "react"
import { Feed } from "@/components/layout/Feed"
import { Sidebar } from "@/components/layout/Sidebar"
import { UserProfile } from "@/components/user/UserProfile"
import { NavigationBar } from "@/components/ui/NavigationBar"
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
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-8 h-8 text-[#00FFBD]" />
        <h1 className="text-2xl sm:text-3xl font-bold">Communities</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Web3 Builders", members: "1.2K", icon: "🏗️" },
          { title: "Verified Humans", members: "5.4K", icon: "✅" },
          { title: "AI & Technology", members: "3.2K", icon: "🤖" },
          { title: "Privacy Advocates", members: "2.1K", icon: "🔒" },
        ].map((community) => (
          <div
            key={community.title}
            className="p-6 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-[#00FFBD]/30 transition cursor-pointer"
          >
            <div className="text-4xl mb-3">{community.icon}</div>
            <p className="text-lg font-semibold text-white mb-1">{community.title}</p>
            <p className="text-sm text-gray-400">{community.members} members</p>
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
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <DollarSign className="w-8 h-8 text-[#00FFBD]" />
        <h1 className="text-2xl sm:text-3xl font-bold">Earnings</h1>
      </div>
      
      {/* Balance Card */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-[#00FFBD]/20 to-gray-900 border border-[#00FFBD]/30 mb-6">
        <p className="text-sm text-gray-400 mb-2">Total Earnings</p>
        <p className="text-4xl font-bold text-[#00FFBD] mb-4">$0.00</p>
        <button className="bg-[#00FFBD] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00E5A8] transition-all shadow-[0_0_20px_rgba(0,255,189,0.3)]">
          Withdraw
        </button>
      </div>

      {/* Earning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Posts Created", value: "0", icon: "📝" },
          { title: "Engagement", value: "0", icon: "❤️" },
          { title: "Referrals", value: "0", icon: "👥" },
        ].map((stat) => (
          <div
            key={stat.title}
            className="p-6 rounded-lg bg-gray-900/50 border border-gray-800"
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
