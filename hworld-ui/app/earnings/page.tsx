import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { TrendingUp, Award, DollarSign, Zap, Trophy, Star, Info, Check } from "lucide-react"

const badges = [
  { icon: Trophy, label: "1000 Likes", color: "from-yellow-500 to-orange-500" },
  { icon: Star, label: "First Payment", color: "#00FFBD" },
  { icon: Zap, label: "Elite Tier", color: "from-purple-500 to-pink-500" },
]

const earningsData = [
  { day: "Mon", amount: 34.2 },
  { day: "Tue", amount: 52.8 },
  { day: "Wed", amount: 45.6 },
  { day: "Thu", amount: 67.9 },
  { day: "Fri", amount: 89.4 },
  { day: "Sat", amount: 103.2 },
  { day: "Sun", amount: 78.3 },
]

export default function EarningsPage() {
  const totalEarnings = 12847.5
  const weekEarnings = earningsData.reduce((sum, day) => sum + day.amount, 0)
  const projectedMonthly = (weekEarnings / 7) * 30

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-xs text-zinc-500">Your creator dashboard</p>
        </div>
      </div>

      <div className="px-4">
        <div className="rounded-3xl p-6 glow-cyan" style={{ backgroundColor: "#00FFBD" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-black/70">Total Earnings</span>
            <DollarSign className="w-5 h-5 text-black" />
          </div>
          <div className="text-5xl font-bold mb-1 text-black">
            ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-sm text-black/70">
            <TrendingUp className="w-4 h-4" />
            <span>+23% this month</span>
          </div>
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">This Week</p>
          <p className="text-2xl font-bold" style={{ color: "#00FFBD" }}>
            ${weekEarnings.toFixed(2)}
          </p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Projected Monthly</p>
          <p className="text-2xl font-bold" style={{ color: "#00FFBD" }}>
            ${projectedMonthly.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold mb-4">Last 7 Days</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {earningsData.map((day, index) => {
              const maxAmount = Math.max(...earningsData.map((d) => d.amount))
              const height = (day.amount / maxAmount) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${height}%`, backgroundColor: "#00FFBD" }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{day.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Creator Tier Progress */}
      <div className="px-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold mb-1">Creator Rank</h3>
              <p className="text-xs text-zinc-500">Level up to earn more per post</p>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-purple-400">Elite</span>
              <span className="text-zinc-500">Next: Legend</span>
            </div>

            <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: "73%", backgroundColor: "#00FFBD" }}
              />
            </div>

            <p className="text-xs text-zinc-500">730 / 1000 engagement points to Legend tier</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#00FFBD20" }}
                >
                  <TrendingUp className="w-5 h-5" style={{ color: "#00FFBD" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Post Likes</p>
                  <p className="text-xs text-zinc-500">14.2K total</p>
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: "#00FFBD" }}>
                +$287.40
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Comments</p>
                  <p className="text-xs text-zinc-500">3.8K total</p>
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: "#00FFBD" }}>
                +$152.80
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Saves</p>
                  <p className="text-xs text-zinc-500">2.1K total</p>
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: "#00FFBD" }}>
                +$89.20
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold mb-4">Achievements</h3>
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${typeof badge.color === "string" ? "" : "bg-gradient-to-br"}`}
                  style={typeof badge.color === "string" ? { backgroundColor: badge.color } : undefined}
                >
                  <badge.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-center text-zinc-400">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="border rounded-2xl p-6" style={{ backgroundColor: "#00FFBD20", borderColor: "#00FFBD80" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold mb-1">Connected Wallet</h3>
              <p className="text-xs text-zinc-500 font-mono">0x7a9f...3d2c</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#00FFBD20" }}
            >
              <DollarSign className="w-5 h-5" style={{ color: "#00FFBD" }} />
            </div>
          </div>
          <Button className="w-full text-black font-bold rounded-full py-6" style={{ backgroundColor: "#00FFBD" }}>
            Withdraw to Wallet
          </Button>
        </div>
      </div>

      {/* Boost Earnings */}
      <div className="px-4 mb-6">
        <Button
          variant="outline"
          className="w-full border-zinc-800 hover:border-zinc-600 rounded-2xl py-6 bg-transparent"
        >
          <Zap className="w-5 h-5 mr-2" />
          Boost Your Earnings
        </Button>
      </div>

      {/* Explanation about creator revenue and early user benefits */}
      <div className="px-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#00FFBD20" }}
            >
              <Info className="w-5 h-5" style={{ color: "#00FFBD" }} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold mb-2">How Creator Revenue Works</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                All creator earnings on H World are funded by platform sponsors and advertisers. Your content generates
                real value, and we ensure you're rewarded for it.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                <span className="font-semibold" style={{ color: "#00FFBD" }}>
                  Early Active Users:
                </span>{" "}
                Join the H World ecosystem early to earn exclusive badges that permanently increase your earnings
                multiplier. The sooner you contribute quality content, the higher your ROI on every post in the future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Plans Section */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold mb-4">Creator Plans</h2>
        <div className="grid gap-4">
          {/* Free Plan */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-2xl font-bold mt-2">
                  $0<span className="text-sm text-zinc-500">/mo</span>
                </p>
              </div>
              <Button variant="outline" className="border-zinc-700 hover:border-zinc-600 bg-transparent rounded-full">
                Current Plan
              </Button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">10 posts per day</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">280 characters per post</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">20% withdrawal fees</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">Basic analytics</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-zinc-950 border-2 rounded-2xl p-6 glow-cyan" style={{ borderColor: "#00FFBD" }}>
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-black border"
              style={{ color: "#00FFBD", borderColor: "#00FFBD" }}
            >
              BEST VALUE
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Pro Creator</h3>
                <p className="text-2xl font-bold mt-2" style={{ color: "#00FFBD" }}>
                  $7.40<span className="text-sm text-zinc-500">/mo</span>
                </p>
              </div>
              <Button className="rounded-full font-bold text-black" style={{ backgroundColor: "#00FFBD" }}>
                Upgrade Now
              </Button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    Unlimited
                  </span>{" "}
                  content publishing
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    1000 characters
                  </span>{" "}
                  per post
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    5% withdrawal fees
                  </span>{" "}
                  (75% savings)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">
                  <span className="font-semibold" style={{ color: "#00FFBD" }}>
                    Season 1 Human Badge
                  </span>{" "}
                  (unique & permanent)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">Priority support & advanced analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00FFBD" }} />
                <span className="text-sm">Early access to new features</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <NavigationBar active="earnings" />
    </div>
  )
}
