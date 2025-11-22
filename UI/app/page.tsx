"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { MainApp } from "@/components/main-app"

export default function Home() {
  const [isVerified, setIsVerified] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  if (!isVerified) {
    return (
      <WelcomeScreen
        onVerified={(id) => {
          setUserId(id)
          setIsVerified(true)
        }}
      />
    )
  }

  return <MainApp userId={userId} />
}
