"use client"

interface PostCardProps {
  post: any
  onLike: () => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <div className="p-4 hover:bg-card transition cursor-pointer border-b border-border">
      <div className="flex gap-4">
        {/* Avatar */}
        <img src={post.avatar || "/placeholder.svg"} alt={post.author} className="w-12 h-12 rounded-full bg-muted" />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-foreground">{post.author}</p>
            {post.verified && (
              <span className="text-accent text-sm" title="Verified Human">
                ✓
              </span>
            )}
            <p className="text-muted-foreground">{post.handle}</p>
            <p className="text-muted-foreground text-sm">· {post.timestamp}</p>
          </div>

          <p className="mt-2 text-foreground text-base">{post.content}</p>

          {/* Interactions */}
          <div className="mt-3 flex gap-8 text-muted-foreground text-sm max-w-md">
            <button className="hover:text-accent transition">💬 {post.comments}</button>
            <button className="hover:text-accent transition">🔁 {Math.floor(post.likes * 0.3)}</button>
            <button onClick={onLike} className={`transition ${post.liked ? "text-accent" : "hover:text-accent"}`}>
              {post.liked ? "❤️" : "🤍"} {post.likes}
            </button>
            <button className="hover:text-accent transition">📤</button>
          </div>
        </div>
      </div>
    </div>
  )
}
