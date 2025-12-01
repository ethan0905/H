"use client"

import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { AvatarInitial } from "@/components/avatar-initial"
import { Share2, Award, TrendingUp, ArrowLeft, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { use, useState } from "react"

const users = {
  "sarah-chen": {
    name: "Sarah Chen",
    username: "sarahchen",
    tier: "Legend",
    tierColor: "from-yellow-500 to-orange-500",
    bio: "Digital artist & creative technologist. Building at the intersection of human creativity and technology. All content 100% human-made.",
    stats: { posts: 342, followers: 48200, earned: 12800 },
    posts: [
      {
        id: 1,
        content: "Just launched my new AI art series!",
        likes: 2847,
        comments: 384,
        earnings: 127.5,
        time: "2h ago",
      },
      {
        id: 2,
        content: "The value of human creativity has never been higher.",
        likes: 1923,
        comments: 267,
        earnings: 89.3,
        time: "5h ago",
      },
      {
        id: 3,
        content: "Built my first app entirely by hand-coding.",
        likes: 1456,
        comments: 198,
        earnings: 64.2,
        time: "8h ago",
      },
    ],
  },
  "emma-thompson": {
    name: "Emma Thompson",
    username: "emmathompson",
    tier: "Pioneer",
    tierColor: "from-blue-500 to-cyan-500",
    bio: "Developer & educator. Teaching humans to code without AI assistance. Building the future, one line at a time.",
    stats: { posts: 156, followers: 23400, earned: 5600 },
    posts: [
      {
        id: 1,
        content: "Built my first app entirely by hand-coding. No AI assistants!",
        likes: 1456,
        comments: 198,
        earnings: 64.2,
        time: "8h ago",
      },
      {
        id: 2,
        content: "Teaching my first coding bootcamp for verified humans only.",
        likes: 892,
        comments: 134,
        earnings: 42.1,
        time: "1d ago",
      },
    ],
  },
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params)
  const username = resolvedParams.username
  const [isFollowing, setIsFollowing] = useState(false)

  const user = users[username as keyof typeof users]

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-zinc-500 mb-4">This profile does not exist</p>
          <Link href="/feed">
            <Button style={{ backgroundColor: "#00FFBD" }} className="text-black font-semibold rounded-full">
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link href="/feed">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-xs text-zinc-500">{user.stats.posts} posts</p>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <AvatarInitial name={user.name} size="xl" />
            {/* Human Verified Badge */}
            <div
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-black"
              style={{ backgroundColor: "#00FFBD" }}
            >
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-sm text-zinc-500 mb-2">@{user.username}</p>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 bg-gradient-to-r ${user.tierColor} rounded-full text-xs font-bold`}>
                {user.tier}
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{ backgroundColor: "#00FFBD20", color: "#00FFBD" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00FFBD" }} />
                Human Verified
              </div>
            </div>
          </div>
        </div>

        <p className="text-zinc-300 leading-relaxed mb-6">{user.bio}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{user.stats.posts}</p>
            <p className="text-xs text-zinc-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{(user.stats.followers / 1000).toFixed(1)}K</p>
            <p className="text-xs text-zinc-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: "#00FFBD" }}>
              ${(user.stats.earned / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-zinc-500">Earned</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setIsFollowing(!isFollowing)}
            className={
              isFollowing
                ? "text-black font-semibold rounded-full bg-zinc-800 hover:bg-zinc-700"
                : "text-black font-semibold rounded-full"
            }
            style={isFollowing ? {} : { backgroundColor: "#00FFBD" }}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
          <Button variant="outline" className="border-zinc-800 hover:border-zinc-600 rounded-full bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Highlights */}
      <div className="px-4 py-6 border-t border-zinc-900">
        <h3 className="text-sm font-bold mb-4">Highlights</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: "#00FFBD" }} />
              <span className="text-xs text-zinc-500">Total</span>
            </div>
            <p className="text-2xl font-bold mb-1">{Math.floor((user.stats.followers * 6) / 1000)}K</p>
            <p className="text-xs text-zinc-500">Total Engagement</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-zinc-500">Rank</span>
            </div>
            <p className="text-2xl font-bold mb-1">#142</p>
            <p className="text-xs text-zinc-500">Global Creator</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 border-t border-zinc-900">
        <h3 className="text-sm font-bold mb-4">Posts</h3>
        <div className="space-y-4">
          {user.posts.map((post) => (
            <div key={post.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <AvatarInitial name={user.name} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{user.name}</span>
                    <span className="text-xs text-zinc-500">{post.time}</span>
                  </div>
                  <span className={`text-xs text-transparent bg-clip-text bg-gradient-to-r ${user.tierColor}`}>
                    {user.tier}
                  </span>
                </div>
              </div>
              <p className="text-zinc-200 mb-4 leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-6 text-zinc-400">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NavigationBar active="home" />
    </div>
  )
}
