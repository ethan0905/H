"use client"

import { useState, useEffect } from "react"
import { Feed } from "@/components/layout/Feed"
import { Sidebar } from "@/components/layout/Sidebar"
import { UserProfile } from "@/components/user/UserProfile"

interface MainAppProps {
  userId: string | null
}

type View = "feed" | "profile" | "explore" | "messages"

export function MainApp({ userId }: MainAppProps) {
  const [currentView, setCurrentView] = useState<View>("feed")
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user_profile")
    if (stored) {
      setUserProfile(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content - Full width on mobile, adjusted on desktop */}
      <main className="flex-1 overflow-y-auto sm:border-l sm:border-r border-border pb-16 sm:pb-0">
        {currentView === "feed" && <Feed userId={userId} profile={userProfile} />}
        {currentView === "profile" && <UserProfile profile={userProfile} setProfile={setUserProfile} />}
        {currentView === "explore" && <ExploreView />}
      </main>

      {/* Right Sidebar - Trending (Desktop only) */}
      <aside className="hidden lg:block w-72 border-l border-border p-6 overflow-y-auto bg-background">
        <h2 className="text-xl font-bold text-foreground mb-6">Trending</h2>
        <div className="space-y-4">
          {["Web3", "Verified Humans", "AI", "Decentralization", "Privacy"].map((tag) => (
            <div
              key={tag}
              className="p-3 rounded-lg bg-card hover:bg-muted cursor-pointer transition border border-border"
            >
              <p className="text-sm text-muted-foreground">Trending Worldwide</p>
              <p className="font-semibold text-foreground">#{tag}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}

function ExploreView() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Explore Humanverse</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Trending Posts", count: "1.2K" },
          { title: "New Members", count: "342" },
          { title: "Active Communities", count: "89" },
          { title: "Global Conversations", count: "2.5K" },
        ].map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-xl bg-surface border border-border hover:border-accent transition"
          >
            <p className="text-text-secondary text-sm mb-2">{item.title}</p>
            <p className="text-3xl font-bold text-accent">{item.count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileBottomNav({ currentView, onViewChange }: { currentView: View; onViewChange: (view: View) => void }) {
  const navItems = [
    { id: "feed", label: "Feed", icon: "📰" },
    { id: "explore", label: "Explore", icon: "🔍" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentView === item.id
                ? "text-brand"
                : "text-muted-foreground"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
