"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallback() {
  const router = useRouter()
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

    const timer = setTimeout(() => {
      router.push("/")
      router.refresh()
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white">
          {miniKitContext ? "Completing Farcaster authentication..." : "Completing authentication..."}
        </p>
      </div>
    </div>
  )
}
