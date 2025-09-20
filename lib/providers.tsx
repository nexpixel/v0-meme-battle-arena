"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { base } from "wagmi/chains"
import { WagmiProvider } from "wagmi"
import { createConfig, http } from "wagmi"
import { getOnchainKitConfig } from "./actions/get-onchainkit-config"

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [apiKey, setApiKey] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getOnchainKitConfig()
      .then((config) => {
        setApiKey(config.apiKey)
        setIsLoading(false)
        if (!config.apiKey) {
          console.warn("[v0] OnchainKit API key is missing. Some features may not work properly.")
        }
      })
      .catch((error) => {
        console.error("[v0] Failed to load OnchainKit config:", error)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={apiKey} chain={base}>
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
