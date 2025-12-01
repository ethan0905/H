import Link from "next/link"
import { Home, Users, PlusCircle, DollarSign, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationBarProps {
  active: "home" | "communities" | "create" | "earnings" | "profile"
  className?: string
  onNavigate?: (view: "home" | "communities" | "create" | "earnings" | "profile") => void
}

export function NavigationBar({ active, className, onNavigate }: NavigationBarProps) {
  const handleClick = (e: React.MouseEvent, view: "home" | "communities" | "create" | "earnings" | "profile") => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(view)
    }
  }

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800 z-50", className)}>
      <div className="flex items-center justify-around py-2 px-2">
        <Link
          href="/?guest=true"
          onClick={(e) => handleClick(e, "home")}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            active === "home" ? "text-[#00FFBD]" : "text-gray-500 hover:text-gray-300",
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          href="/communities"
          onClick={(e) => handleClick(e, "communities")}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            active === "communities" ? "text-[#00FFBD]" : "text-gray-500 hover:text-gray-300",
          )}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Communities</span>
        </Link>

        <button
          onClick={(e) => handleClick(e, "create")}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center -mt-6 border-4 border-black shadow-[0_0_20px_rgba(0,255,189,0.4)]",
              active === "create" ? "bg-[#00FFBD] text-black" : "bg-gray-800 text-white",
            )}
          >
            <PlusCircle className="w-6 h-6" />
          </div>
        </button>

        <Link
          href="/earnings"
          onClick={(e) => handleClick(e, "earnings")}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            active === "earnings" ? "text-[#00FFBD]" : "text-gray-500 hover:text-gray-300",
          )}
        >
          <DollarSign className="w-6 h-6" />
          <span className="text-xs font-medium">Earnings</span>
        </Link>

        <Link
          href="/profile"
          onClick={(e) => handleClick(e, "profile")}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            active === "profile" ? "text-[#00FFBD]" : "text-gray-500 hover:text-gray-300",
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  )
}
