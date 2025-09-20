import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/layout/navigation"
import { Providers } from "@/lib/providers"
import { AutoAuth } from "@/components/auth/auto-auth"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Meme Battle Arena",
  description: "The ultimate cyberpunk meme battle experience",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-mono antialiased scanlines ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <AutoAuth>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<div>Loading...</div>}>
                <Navigation />
              </Suspense>
              <main className="pt-20 pb-20 md:pb-8">{children}</main>
            </div>
          </AutoAuth>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
