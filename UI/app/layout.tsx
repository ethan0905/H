import type React from "react"
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Humanverse - Verified Social Network",
  description: "Connect with verified humans in a trusted social ecosystem",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <MiniKitProvider>{children}</MiniKitProvider>
      </body>
    </html>
  )
}
