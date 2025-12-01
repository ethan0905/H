"use client"

import { useState } from "react"
import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { ImageIcon, Video, Type, TrendingUp } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function CreatePage() {
  const [content, setContent] = useState("")
  const [selectedType, setSelectedType] = useState<"text" | "image" | "video">("text")

  const estimatedEarnings = Math.min(content.length * 0.05, 50)

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create</h1>
          <Button
            disabled={!content.trim()}
            className="text-black font-bold rounded-full px-6"
            style={{ backgroundColor: "#00FFBD" }}
          >
            Post
          </Button>
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="px-4 py-6 border-b border-zinc-900">
        <p className="text-sm text-zinc-400 mb-3">Content Type</p>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={selectedType === "text" ? "default" : "outline"}
            className={`flex flex-col items-center gap-2 h-20 ${
              selectedType === "text" ? "text-black" : "border-zinc-800 hover:border-zinc-600 bg-transparent"
            }`}
            style={selectedType === "text" ? { backgroundColor: "#00FFBD" } : undefined}
            onClick={() => setSelectedType("text")}
          >
            <Type className="w-5 h-5" />
            <span className="text-xs font-semibold">Text</span>
          </Button>
          <Button
            variant={selectedType === "image" ? "default" : "outline"}
            className={`flex flex-col items-center gap-2 h-20 ${
              selectedType === "image" ? "text-black" : "border-zinc-800 hover:border-zinc-600 bg-transparent"
            }`}
            style={selectedType === "image" ? { backgroundColor: "#00FFBD" } : undefined}
            onClick={() => setSelectedType("image")}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs font-semibold">Image</span>
          </Button>
          <Button
            variant={selectedType === "video" ? "default" : "outline"}
            className={`flex flex-col items-center gap-2 h-20 ${
              selectedType === "video" ? "text-black" : "border-zinc-800 hover:border-zinc-600 bg-transparent"
            }`}
            style={selectedType === "video" ? { backgroundColor: "#00FFBD" } : undefined}
            onClick={() => setSelectedType("video")}
          >
            <Video className="w-5 h-5" />
            <span className="text-xs font-semibold">Video</span>
          </Button>
        </div>
      </div>

      {/* Content Input */}
      <div className="px-4 py-6">
        <Textarea
          placeholder="Share your human perspective..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 resize-none text-base"
        />
      </div>

      <div className="mx-4 mb-6">
        <div className="border rounded-2xl p-6" style={{ backgroundColor: "#00FFBD10", borderColor: "#00FFBD30" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: "#00FFBD" }} />
              <span className="text-sm font-semibold text-zinc-300">Estimated Earnings</span>
            </div>
          </div>

          {/* Earnings Meter */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold" style={{ color: "#00FFBD" }}>
                ${estimatedEarnings.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500">per 1000 views</span>
            </div>

            <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((estimatedEarnings / 50) * 100, 100)}%`, backgroundColor: "#00FFBD" }}
              />
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Based on engagement, content quality, and your creator tier
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mx-4 mb-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">💡 Maximize Your Earnings</h3>
        <ul className="space-y-2 text-xs text-zinc-400">
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

      <NavigationBar active="create" />
    </div>
  )
}
