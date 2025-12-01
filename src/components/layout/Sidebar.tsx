"use client"
import { Button } from "@/components/ui/button"
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'next/navigation'

type View = "home" | "communities" | "create" | "earnings" | "profile"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { logout, user } = useUserStore()
  const router = useRouter()
  
  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { id: "home" as View, label: "Home", icon: "🏠" },
    { id: "communities" as View, label: "Communities", icon: "�" },
    { id: "earnings" as View, label: "Earnings", icon: "�" },
    { id: "profile" as View, label: "Profile", icon: "👤" },
  ]

  return (
    <aside className="hidden sm:flex flex-col w-16 md:w-64 border-r border-gray-800 p-3 md:p-6 overflow-y-auto bg-black">
      {/* Logo */}
      <div className="mb-8 md:mb-12">
        <div className="text-3xl font-bold text-center md:text-left">
          <span className="text-[#00FFBD]">H</span>
        </div>
        <p className="hidden md:block text-sm text-gray-400 mt-1">Humanverse</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 mb-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "profile" && user) {
                router.push(`/profile/${encodeURIComponent(user.id)}`)
              } else {
                onViewChange(item.id)
              }
            }}
            className={`w-full text-left px-2 md:px-4 py-3 rounded-lg transition-all flex items-center justify-center md:justify-start ${
              currentView === item.id
                ? "bg-[#00FFBD]/10 text-[#00FFBD] border-2 border-[#00FFBD] shadow-[0_0_20px_rgba(0,255,189,0.2)]"
                : "text-gray-400 hover:bg-gray-900 hover:text-[#00FFBD] hover:border-2 hover:border-[#00FFBD]/30 border-2 border-transparent"
            }`}
          >
            <span className="text-xl md:mr-3">{item.icon}</span>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Compose Button */}
      <div className="space-y-3">
        <Button 
          onClick={() => onViewChange("create")}
          className="w-full bg-[#00FFBD] hover:bg-[#00E5A8] text-black font-semibold rounded-lg py-3 transition-all shadow-[0_0_20px_rgba(0,255,189,0.3)] hover:shadow-[0_0_30px_rgba(0,255,189,0.5)]"
        >
          <span className="md:hidden text-2xl">+</span>
          <span className="hidden md:inline">+ Create</span>
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-gray-700 text-white hover:bg-gray-900 hover:border-gray-600 rounded-lg py-3 bg-transparent"
        >
          <span className="md:hidden text-xl">🚪</span>
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
