"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState<"welcome" | "verifying" | "verified">("welcome")

  const handleVerify = () => {
    setStep("verifying")
    setTimeout(() => {
      setStep("verified")
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Status Bar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800">
        <div className="text-xs">9:41</div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 border border-white rounded-sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {step === "welcome" && (
          <>
            <div className="relative w-40 h-40">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ backgroundColor: "#00FFBD" }}
              />
              <div
                className="relative w-full h-full rounded-full flex items-center justify-center border-2"
                style={{ backgroundColor: "#00FFBD20", borderColor: "#00FFBD" }}
              >
                <span className="text-7xl">🌍</span>
              </div>
            </div>

            <div className="text-center space-y-4 max-w-sm">
              <h1 className="text-4xl font-bold text-balance leading-tight">Welcome to H World</h1>
              <p className="text-lg text-zinc-400 leading-relaxed">The social network for verified humans.</p>
              <p className="text-base text-zinc-500 leading-relaxed">
                Connect, create, and earn in a human-only community powered by World ID verification.
              </p>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full max-w-sm text-black font-bold py-6 rounded-full text-lg glow-cyan"
              style={{ backgroundColor: "#00FFBD" }}
            >
              Verify with World ID
            </Button>

            <p className="text-xs text-zinc-600 text-center max-w-xs">
              By continuing, you agree that you are a verified human via World ID
            </p>
          </>
        )}

        {step === "verifying" && (
          <>
            <div className="relative w-40 h-40">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60 pulse-glow"
                style={{ backgroundColor: "#00FFBD" }}
              />
              <div
                className="relative w-full h-full rounded-full flex items-center justify-center border-2"
                style={{ backgroundColor: "#00FFBD", borderColor: "#00FFBD" }}
              >
                <LoaderIcon className="w-16 h-16 animate-spin text-black" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Verifying...</h2>
              <p className="text-lg text-zinc-400">Confirming your human identity</p>
            </div>
          </>
        )}

        {step === "verified" && (
          <>
            <div className="relative w-40 h-40">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60"
                style={{ backgroundColor: "#00FFBD" }}
              />
              <div
                className="relative w-full h-full rounded-full flex items-center justify-center border-2"
                style={{ backgroundColor: "#00FFBD", borderColor: "#00FFBD" }}
              >
                <CheckIcon className="w-20 h-20 text-black" />
              </div>
            </div>

            <div className="text-center space-y-4 max-w-sm">
              <h2 className="text-4xl font-bold text-balance">You're officially Human Verified</h2>
              <p className="text-lg text-zinc-400 leading-relaxed">Welcome to the future of social networking</p>
            </div>

            <Link href="/feed" className="w-full max-w-sm">
              <Button
                className="w-full text-black font-bold py-6 rounded-full text-lg"
                style={{ backgroundColor: "#00FFBD" }}
              >
                Enter H World
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
