"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@supabase/ssr"

export function SIWFButton() {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState("")
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [context, setContext] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const loadMiniKit = async () => {
      try {
        if (typeof window !== "undefined") {
          const { useMiniKit } = await import("@coinbase/minikit")
          const { useAuthenticate } = await import("@coinbase/onchainkit/minikit")

          setMiniKitAvailable(true)
          // Note: We can't use hooks dynamically, so we'll handle this differently
        }
      } catch (error) {
        console.log("MiniKit not available, falling back to regular auth")
        setMiniKitAvailable(false)
      }
    }

    loadMiniKit()
  }, [])

  const handleAuth = async () => {
    setIsAuthenticating(true)
    setError("")

    try {
      if (miniKitAvailable) {
        // Dynamic import and authentication for MiniKit
        const { useAuthenticate } = await import("@coinbase/onchainkit/minikit")
        // Note: This approach won't work with hooks, we need a different strategy

        // For now, redirect to a simpler auth flow
        window.location.href = "/auth/callback"
      } else {
        // Fallback authentication method
        setError("Please use Farcaster or Base App for authentication")
      }
    } catch (error) {
      console.error("Authentication failed:", error)
      setError("Authentication failed. Please try again.")
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleAuth}
        disabled={isAuthenticating}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
      >
        {isAuthenticating ? "Authenticating..." : "🟣 Sign In with Farcaster"}
      </Button>

      {!miniKitAvailable && (
        <div className="text-center text-sm text-gray-400">
          <p>Best experienced in Farcaster or Base App</p>
        </div>
      )}
    </div>
  )
}
