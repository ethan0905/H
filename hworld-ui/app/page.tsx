import Link from "next/link"

export default function HWorldHome() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation to all screens */}
      <div className="bg-zinc-950 border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-white mb-4">H World - All Screens</h1>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/onboarding"
            className="bg-[#00FFBD] hover:bg-[#00FFBD]/90 text-black px-4 py-2 rounded-lg text-sm font-semibold text-center"
          >
            1. Onboarding
          </Link>
          <Link
            href="/feed"
            className="bg-[#00FFBD] hover:bg-[#00FFBD]/90 text-black px-4 py-2 rounded-lg text-sm font-semibold text-center"
          >
            2. Home Feed
          </Link>
          <Link
            href="/communities"
            className="bg-[#00FFBD] hover:bg-[#00FFBD]/90 text-black px-4 py-2 rounded-lg text-sm font-semibold text-center"
          >
            3. Communities
          </Link>
          <Link
            href="/create"
            className="bg-[#00FFBD] hover:bg-[#00FFBD]/90 text-black px-4 py-2 rounded-lg text-sm font-semibold text-center"
          >
            4. Create
          </Link>
          <Link
            href="/earnings"
            className="bg-[#00FFBD] hover:bg-[#00FFBD]/90 text-black px-4 py-2 rounded-lg text-sm font-semibold text-center"
          >
            5. Earnings
          </Link>
          <Link
            href="/profile"
            className="bg-[#00FFBD] hover:bg-[#00FFBD]/90 text-black px-4 py-2 rounded-lg text-sm font-semibold text-center"
          >
            6. Profile
          </Link>
        </div>
      </div>

      {/* Welcome Hero */}
      <div className="flex-1 bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-50 pulse-glow"
              style={{ backgroundColor: "#00FFBD" }}
            />
            <div
              className="relative w-full h-full rounded-full flex items-center justify-center border-4"
              style={{ borderColor: "#00FFBD", backgroundColor: "#00FFBD20" }}
            >
              <span className="text-5xl">🌍</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-balance">H World</h1>
            <p className="text-xl text-zinc-400">Human World</p>
          </div>

          <p className="text-lg text-zinc-300 leading-relaxed text-balance">
            The exclusive social network for verified humans. Create, connect, and earn real money for your content.
          </p>

          <Link
            href="/onboarding"
            className="inline-block text-black font-bold py-4 px-8 rounded-full text-lg glow-cyan transition-all"
            style={{ backgroundColor: "#00FFBD" }}
          >
            Explore All Screens
          </Link>
        </div>
      </div>
    </div>
  )
}
