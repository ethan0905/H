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
    <aside className="hidden sm:flex flex-col w-16 md:w-64 border-r border-border p-3 md:p-6 overflow-y-auto bg-background">
      {/* Logo */}
      <div className="mb-8 md:mb-12">
        <div className="text-3xl font-bold text-center md:text-left">
          <span className="text-brand">H</span>
        </div>
        <p className="hidden md:block text-sm text-muted-foreground mt-1">Humanverse</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 mb-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full text-left px-2 md:px-4 py-3 rounded-lg transition-all flex items-center justify-center md:justify-start ${
              currentView === item.id
                ? "bg-brand/20 text-brand border-2 border-brand"
                : "text-muted-foreground hover:bg-brand/10 hover:text-brand hover:border-2 hover:border-brand border-2 border-transparent"
            }`}
          >
            <span className="text-xl md:mr-3">{item.icon}</span>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Compose Button */}
      <div className="space-y-3">
        <Button className="w-full bg-brand hover:bg-brand-600 text-black font-semibold rounded-lg py-3 transition-colors">
          <span className="md:hidden text-2xl">+</span>
          <span className="hidden md:inline">+ Compose</span>
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-border text-foreground hover:bg-card rounded-lg py-3 bg-transparent"
        >
          <span className="md:hidden text-xl">🚪</span>
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
