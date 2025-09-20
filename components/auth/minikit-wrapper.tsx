"use client"

import { type ReactNode, useEffect, useState } from "react"

interface MiniKitWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function MiniKitWrapper({ children, fallback }: MiniKitWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasMiniKit, setHasMiniKit] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if we're in a MiniKit environment
    setHasMiniKit(typeof window !== "undefined" && window.location.href.includes("minikit"))
  }, [])

  if (!isMounted) {
    return fallback || <div>Loading...</div>
  }

  return <>{children}</>
}
