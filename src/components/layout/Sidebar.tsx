"use client"
import { Button } from "@/components/ui/Button"
import { useUserStore } from '@/store/userStore'

type View = "feed" | "profile" | "explore" | "messages"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { logout } = useUserStore()
  
  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { id: "feed", label: "Feed", icon: "📰" },
    { id: "explore", label: "Explore", icon: "🔍" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ]

  return (
    <aside className="hidden sm:flex flex-col w-64 border-r border-border p-6 overflow-y-auto bg-background">
      {/* Logo */}
      <div className="mb-12">
        <div className="text-3xl font-bold">
          <span className="text-brand">H</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Humanverse</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 mb-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              currentView === item.id
                ? "bg-brand/20 text-brand border-2 border-brand"
                : "text-muted-foreground hover:bg-brand/10 hover:text-brand hover:border-2 hover:border-brand border-2 border-transparent"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Compose Button */}
      <div className="space-y-3">
        <Button className="w-full bg-brand hover:bg-brand-600 text-black font-semibold rounded-lg py-3 transition-colors">
          + Compose
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-border text-foreground hover:bg-card rounded-lg py-3 bg-transparent"
        >
          Logout
        </Button>
      </div>
    </aside>
  )
}
