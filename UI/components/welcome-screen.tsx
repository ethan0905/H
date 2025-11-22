"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
  onVerified: (userId: string) => void
}

export function WelcomeScreen({ onVerified }: WelcomeScreenProps) {
  const handleVerify = useCallback(() => {
    const userId = `human_${Date.now()}`
    localStorage.setItem("world_verified", "true")
    localStorage.setItem("world_user_id", userId)
    localStorage.setItem(
      "user_profile",
      JSON.stringify({
        id: userId,
        username: `human_${userId.slice(0, 8)}`,
        bio: "Just joined Humanverse",
        avatar: `https://avatar.vercel.sh/${userId}`,
        followers: [],
        following: [],
      }),
    )
    onVerified(userId)
  }, [onVerified])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="space-y-4">
          <div className="inline-block">
            <div className="text-6xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              H
            </div>
          </div>
          <h1 className="text-4xl font-bold text-text-primary">Humanverse</h1>
          <p className="text-text-secondary text-lg">A social network for verified humans</p>
        </div>

        {/* Features */}
        <div className="space-y-4 bg-surface rounded-2xl p-6 border border-border">
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="text-accent text-xl mt-1">✓</div>
              <div className="text-left">
                <p className="font-semibold text-text-primary">Verified Identity</p>
                <p className="text-sm text-text-secondary">All members are verified as real humans</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="text-accent text-xl mt-1">✓</div>
              <div className="text-left">
                <p className="font-semibold text-text-primary">Trustworthy Network</p>
                <p className="text-sm text-text-secondary">Connect with genuine people around the world</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="text-accent text-xl mt-1">✓</div>
              <div className="text-left">
                <p className="font-semibold text-text-primary">Safe Interactions</p>
                <p className="text-sm text-text-secondary">Built with privacy and security in mind</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleVerify}
          className="w-full h-12 bg-gradient-to-r from-primary to-accent text-text-primary font-semibold rounded-lg hover:opacity-90 transition"
        >
          Verify with World ID
        </Button>

        <p className="text-xs text-text-secondary">
          Your privacy is protected. World ID verifies you're human without storing personal data.
        </p>
      </div>
    </div>
  )
}
