"use client"

import type React from "react"
import { useEffect, useState } from "react"

export function AutoAuth({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)

  useEffect(() => {
    const checkMiniKit = async () => {
      try {
        if (typeof window !== "undefined") {
          // Check if we're in a MiniKit environment
          const isMiniKit =
            window.location.href.includes("minikit") ||
            window.navigator.userAgent.includes("Farcaster") ||
            window.navigator.userAgent.includes("Base")

          setMiniKitAvailable(isMiniKit)

          if (isMiniKit) {
            // Only import MiniKit if we're in the right environment
            try {
              const { useMiniKit } = await import("@coinbase/minikit")
              console.log("MiniKit loaded successfully")
            } catch (error) {
              console.log("MiniKit import failed:", error)
            }
          }
        }
      } catch (error) {
        console.log("MiniKit check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkMiniKit()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
