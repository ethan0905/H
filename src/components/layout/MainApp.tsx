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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto border-l border-r border-border">
        {currentView === "feed" && <Feed userId={userId} profile={userProfile} />}
        {currentView === "profile" && <UserProfile profile={userProfile} setProfile={setUserProfile} />}
        {currentView === "explore" && <ExploreView />}
      </main>

      {/* Right Sidebar - Trending */}
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
    </div>
  )
}

function ExploreView() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Explore Humanverse</h1>
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
