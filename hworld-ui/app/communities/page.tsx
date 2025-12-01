import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { Users, Bot, Globe, Gamepad, Film, Bitcoin } from "lucide-react"

const communities = [
  {
    id: 1,
    name: "AI Agents",
    category: "Technology",
    members: 68293,
    gradient: "from-blue-500 to-cyan-500",
    description: "Discuss AI agents, automation, and the future of artificial intelligence",
    icon: Bot,
  },
  {
    id: 2,
    name: "Human World",
    category: "Community",
    members: 124518,
    gradient: "from-green-500 to-emerald-500",
    description: "The official H World community for verified humans",
    icon: Globe,
  },
  {
    id: 3,
    name: "Gaming",
    category: "Entertainment",
    members: 89104,
    gradient: "from-purple-500 to-pink-500",
    description: "Gaming culture, reviews, and human-created content",
    icon: Gamepad,
  },
  {
    id: 4,
    name: "Movies",
    category: "Entertainment",
    members: 76913,
    gradient: "from-orange-500 to-red-500",
    description: "Film discussions, reviews, and recommendations by humans",
    icon: Film,
  },
  {
    id: 5,
    name: "Bitcoin",
    category: "Finance",
    members: 95267,
    gradient: "from-yellow-500 to-orange-500",
    description: "Cryptocurrency, blockchain, and financial freedom",
    icon: Bitcoin,
  },
]

export default function CommunitiesPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-xs text-zinc-500">Human-verified groups</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Tech", "Community", "Entertainment", "Finance"].map((cat) => (
            <Button
              key={cat}
              variant={cat === "All" ? "default" : "outline"}
              size="sm"
              className={
                cat === "All"
                  ? "rounded-full text-black whitespace-nowrap"
                  : "rounded-full border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 whitespace-nowrap bg-transparent"
              }
              style={cat === "All" ? { backgroundColor: "#00FFBD" } : undefined}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Communities List */}
      <div className="px-4 space-y-4">
        {communities.map((community) => (
          <div key={community.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Banner */}
            <div className={`h-24 bg-gradient-to-r ${community.gradient} opacity-20`} />

            {/* Content */}
            <div className="p-4 -mt-8">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${community.gradient} flex items-center justify-center mb-3 border-4 border-zinc-950`}
              >
                <community.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold mb-1">{community.name}</h3>
              <p className="text-xs text-zinc-500 mb-2">{community.category}</p>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">{community.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{community.members.toLocaleString()} humans</span>
                </div>
                <Button className="text-black font-semibold rounded-full px-6" style={{ backgroundColor: "#00FFBD" }}>
                  Join
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NavigationBar active="communities" />
    </div>
  )
}
