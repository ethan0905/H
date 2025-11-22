"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ComposePostProps {
  onPost: (content: string) => void
  avatar?: string
}

export function ComposePost({ onPost, avatar }: ComposePostProps) {
  const [content, setContent] = useState("")

  const handlePost = () => {
    if (content.trim()) {
      onPost(content)
      setContent("")
    }
  }

  return (
    <div className="p-4 border-b border-border bg-background">
      <div className="flex gap-4">
        <img src={avatar || "https://avatar.vercel.sh/user"} alt="You" className="w-12 h-12 rounded-full bg-muted" />

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?!"
            className="w-full bg-transparent text-foreground text-xl outline-none resize-none placeholder-muted-foreground"
            rows={3}
          />

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handlePost}
              disabled={!content.trim()}
              className="bg-gradient-to-r from-accent to-secondary text-background font-semibold rounded-full px-6 py-2 hover:opacity-90 transition disabled:opacity-50"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
