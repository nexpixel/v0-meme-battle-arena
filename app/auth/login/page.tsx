"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SIWFButton } from "@/components/auth/siwf-button"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const [miniKitContext, setMiniKitContext] = useState<any>(null)

  useEffect(() => {
    const checkMiniKit = () => {
      try {
        if (typeof window !== "undefined") {
          const isMiniKit =
            window.location.href.includes("minikit") ||
            window.navigator.userAgent.includes("Farcaster") ||
            window.navigator.userAgent.includes("Base")

          if (isMiniKit) {
            setMiniKitContext({ user: { displayName: "Farcaster User" } })
          }
        }
      } catch (error) {
        console.log("MiniKit check failed:", error)
      }
    }

    checkMiniKit()
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

      <Card className="w-full max-w-md relative z-10 bg-gray-900/90 border-gray-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Enter the Arena</CardTitle>
          <CardDescription className="text-gray-400">
            {miniKitContext ? "Sign in with your Farcaster account" : "Sign in to battle with the best memes"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <SIWFButton />

          {miniKitContext && (
            <div className="text-center text-sm text-gray-400">
              <p>Welcome, {miniKitContext.user?.displayName || "Farcaster user"}!</p>
              <p>Authenticate to access all features</p>
            </div>
          )}

          {!miniKitContext && (
            <div className="text-center text-sm text-gray-400">
              <p>Best experienced in Farcaster or Base App</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
