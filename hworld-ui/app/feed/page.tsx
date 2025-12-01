"use client"

import { Heart, MessageCircle, Share2, PlusCircle, Repeat2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavigationBar } from "@/components/navigation-bar"
import { AvatarInitial } from "@/components/avatar-initial"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import Link from "next/link"

const posts = [
  {
    id: 1,
    author: "Sarah Chen",
    username: "sarah-chen",
    tier: "Legend",
    tierColor: "from-yellow-500 to-orange-500",
    time: "2h ago",
    content:
      "Just launched my new AI art series! Each piece is 100% human-created, no AI involved. This is what makes H World special 🎨",
    likes: 2847,
    comments: 384,
    retweets: 156,
    views: 12453,
    earnings: 127.5,
    isYours: false,
  },
  {
    id: 2,
    author: "You",
    username: "you",
    tier: "Elite",
    tierColor: "from-purple-500 to-pink-500",
    time: "5h ago",
    content:
      "The value of human creativity has never been higher. Earned $500 this week just by sharing my thoughts. This platform is revolutionary.",
    likes: 1923,
    comments: 267,
    retweets: 89,
    views: 8934,
    earnings: 89.3,
    isYours: true,
  },
  {
    id: 3,
    author: "Emma Thompson",
    username: "emma-thompson",
    tier: "Pioneer",
    tierColor: "from-blue-500 to-cyan-500",
    time: "8h ago",
    content:
      "Built my first app entirely by hand-coding. No AI assistants, just pure human ingenuity. Share your human-made projects below! 💻",
    likes: 1456,
    comments: 198,
    retweets: 67,
    views: 6723,
    earnings: 64.2,
    isYours: false,
  },
]

const mockComments = [
  {
    author: "Alex Johnson",
    content: "This is amazing! Love the creativity here.",
    time: "1h ago",
  },
  {
    author: "Maria Garcia",
    content: "Can't wait to see more of your work!",
    time: "45m ago",
  },
]

export default function FeedPage() {
  const [postContent, setPostContent] = useState("")
  const [expandedComments, setExpandedComments] = useState<number[]>([])

  const estimatedEarnings = Math.min(postContent.length * 0.05, 50).toFixed(2)

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]))
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">H World</h1>
          <p className="text-xs text-zinc-500">Human-verified content only</p>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-zinc-900">
        <div className="flex gap-3">
          <AvatarInitial name="You" size="md" />
          <div className="flex-1">
            <Textarea
              placeholder="Share something with verified humans..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white resize-none min-h-[80px]"
            />
            {postContent.length > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  Estimated earnings:{" "}
                  <span className="font-bold" style={{ color: "#00FFBD" }}>
                    ${estimatedEarnings}
                  </span>
                </div>
                <Button className="text-black font-semibold rounded-full px-6" style={{ backgroundColor: "#00FFBD" }}>
                  Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-1">
        {posts.map((post) => (
          <div key={post.id}>
            <div className="bg-zinc-950 border-b border-zinc-900 p-4">
              {/* Author */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Link href={post.isYours ? "/profile" : `/profile/${post.username}`}>
                    <AvatarInitial name={post.author} size="md" />
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={post.isYours ? "/profile" : `/profile/${post.username}`} className="hover:underline">
                        <h3 className="font-bold">{post.author}</h3>
                      </Link>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#00FFBD" }}
                      >
                        <Check className="w-3 h-3 text-black" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`text-transparent bg-clip-text bg-gradient-to-r ${post.tierColor} font-semibold`}
                      >
                        {post.tier}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-500">{post.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-zinc-100 leading-relaxed mb-4">{post.content}</p>

              {post.isYours && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 mb-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Post Earnings</span>
                  <span className="text-sm font-bold" style={{ color: "#00FFBD" }}>
                    +${post.earnings.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                <Eye className="w-4 h-4" />
                <span>{post.views.toLocaleString()} views</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes.toLocaleString()}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white gap-2"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
                  <Repeat2 className="w-5 h-5" />
                  <span className="text-sm">{post.retweets}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {expandedComments.includes(post.id) && (
              <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-3 space-y-3">
                {mockComments.map((comment, idx) => (
                  <div key={idx} className="flex gap-3">
                    <AvatarInitial name={comment.author} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{comment.author}</span>
                        <span className="text-xs text-zinc-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-zinc-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-24 right-6">
        <Button
          className="w-14 h-14 rounded-full shadow-lg glow-cyan text-black"
          style={{ backgroundColor: "#00FFBD" }}
        >
          <PlusCircle className="w-6 h-6" />
        </Button>
      </div>

      <NavigationBar active="home" />
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}
