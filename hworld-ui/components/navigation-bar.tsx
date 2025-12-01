import Link from "next/link"
import { Home, Users, PlusCircle, DollarSign, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationBarProps {
  active: "home" | "communities" | "create" | "earnings" | "profile"
}

export function NavigationBar({ active }: NavigationBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800">
      <div className="flex items-center justify-around py-2">
        <Link
          href="/feed"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            active === "home" ? "text-[#00FFBD]" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          href="/communities"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            active === "communities" ? "text-[#00FFBD]" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Communities</span>
        </Link>

        <Link
          href="/create"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            active === "create" ? "text-[#00FFBD]" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center -mt-6 border-4 border-black glow-cyan",
              active === "create" ? "text-black" : "text-white",
            )}
            style={{ backgroundColor: active === "create" ? "#00FFBD" : "#27272a" }}
          >
            <PlusCircle className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/earnings"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            active === "earnings" ? "text-[#00FFBD]" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <DollarSign className="w-6 h-6" />
          <span className="text-xs font-medium">Earnings</span>
        </Link>

        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            active === "profile" ? "text-[#00FFBD]" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  )
}
