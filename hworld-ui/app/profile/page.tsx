import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { AvatarInitial } from "@/components/avatar-initial"
import { Settings, Share2, Award, TrendingUp, Users } from "lucide-react"

const userPosts = [
  { id: 1, image: "🎨", likes: 2847, earnings: 127.5 },
  { id: 2, image: "💻", likes: 1923, earnings: 89.3 },
  { id: 3, image: "🌟", likes: 1456, earnings: 64.2 },
  { id: 4, image: "🚀", likes: 3241, earnings: 156.8 },
  { id: 5, image: "✨", likes: 2103, earnings: 98.4 },
  { id: 6, image: "🎯", likes: 1789, earnings: 76.9 },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <AvatarInitial name="Sarah Chen" size="xl" />
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
            <h2 className="text-2xl font-bold mb-1">Sarah Chen</h2>
            <p className="text-sm text-zinc-500 mb-2">@sarahchen</p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold">
                Elite
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

        <p className="text-zinc-300 leading-relaxed mb-6">
          Digital artist & creative technologist. Building at the intersection of human creativity and technology. All
          content 100% human-made.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">342</p>
            <p className="text-xs text-zinc-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">48.2K</p>
            <p className="text-xs text-zinc-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: "#00FFBD" }}>
              $12.8K
            </p>
            <p className="text-xs text-zinc-500">Earned</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button className="text-black font-semibold rounded-full" style={{ backgroundColor: "#00FFBD" }}>
            Edit Profile
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
            <p className="text-2xl font-bold mb-1">287K</p>
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

      {/* Posts Grid */}
      <div className="px-4 py-6 border-t border-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Your Content</h3>
          <span className="text-xs text-zinc-500">342 posts</span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {userPosts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden group"
            >
              <div className="w-full h-full flex items-center justify-center text-4xl">{post.image}</div>
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <p className="text-sm font-bold">{post.likes.toLocaleString()}</p>
                <p className="text-xs text-zinc-400">likes</p>
                <p className="text-xs font-semibold" style={{ color: "#00FFBD" }}>
                  ${post.earnings}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 border-t border-zinc-900">
        <div className="border rounded-2xl p-6" style={{ backgroundColor: "#00FFBD20", borderColor: "#00FFBD80" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold mb-1">Invite Humans</h3>
              <p className="text-xs text-zinc-500">Earn $10 per verified invite</p>
            </div>
            <Users className="w-8 h-8" style={{ color: "#00FFBD" }} />
          </div>
          <Button className="w-full text-black font-bold rounded-full" style={{ backgroundColor: "#00FFBD" }}>
            Invite & Earn Bonus
          </Button>
        </div>
      </div>

      <NavigationBar active="profile" />
    </div>
  )
}
