"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { ComposePost } from "@/components/compose-post"

interface FeedProps {
  userId: string | null
  profile: any
}

export function Feed({ userId, profile }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    // Load posts from localStorage or initialize with sample posts
    const stored = localStorage.getItem("humanverse_posts")
    if (stored) {
      setPosts(JSON.parse(stored))
    } else {
      const initialPosts = [
        {
          id: "1",
          author: "Alice Chen",
          avatar: "https://avatar.vercel.sh/alice",
          handle: "@alice",
          verified: true,
          content: "Just discovered Humanverse! Excited to connect with real humans. 🎉",
          timestamp: "2h ago",
          likes: 234,
          comments: 45,
          liked: false,
        },
        {
          id: "2",
          author: "Bob Smith",
          avatar: "https://avatar.vercel.sh/bob",
          handle: "@bob",
          verified: true,
          content:
            "Building the future of verified social networks. The internet is better when we know who we're talking to.",
          timestamp: "4h ago",
          likes: 567,
          comments: 123,
          liked: false,
        },
      ]
      setPosts(initialPosts)
      localStorage.setItem("humanverse_posts", JSON.stringify(initialPosts))
    }
  }, [])

  const handleNewPost = (content: string) => {
    const newPost = {
      id: Date.now().toString(),
      author: profile?.username || "You",
      avatar: profile?.avatar || "https://avatar.vercel.sh/user",
      handle: "@" + (profile?.username || "user"),
      verified: true,
      content,
      timestamp: "now",
      likes: 0,
      comments: 0,
      liked: false,
    }
    const updated = [newPost, ...posts]
    setPosts(updated)
    localStorage.setItem("humanverse_posts", JSON.stringify(updated))
  }

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  return (
    <div className="max-w-2xl mx-auto border-l border-r border-border">
      {/* Header */}
      <div className="sticky top-0 bg-background bg-opacity-80 backdrop-blur z-10 border-b border-border p-4">
        <h2 className="text-xl font-bold text-foreground">Your Feed</h2>
      </div>

      {/* Compose Post */}
      <ComposePost onPost={handleNewPost} avatar={profile?.avatar} />

      {/* Posts */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
        ))}
      </div>
    </div>
  )
}
