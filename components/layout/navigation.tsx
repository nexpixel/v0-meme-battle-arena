"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Swords, Trophy, Plus, User, ImageIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/", label: "Arena", icon: Home },
  { href: "/memes", label: "Memes", icon: ImageIcon },
  { href: "/battles", label: "Battles", icon: Swords },
  { href: "/create", label: "Create", icon: Plus },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [miniKitContext, setMiniKitContext] = useState<any>(null)
  const [farcasterUser, setFarcasterUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setSupabaseUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user ?? null)
      setLoading(false)
    })

    const loadMiniKit = async () => {
      try {
        if (typeof window !== "undefined") {
          const isMiniKit =
            window.location.href.includes("minikit") ||
            window.navigator.userAgent.includes("Farcaster") ||
            window.navigator.userAgent.includes("Base")

          if (isMiniKit) {
            const { useMiniKit } = await import("@coinbase/minikit")
            const { useAuthenticate } = await import("@coinbase/onchainkit/minikit")
            // Note: Can't use hooks here, will need different approach
          }
        }
      } catch (error) {
        console.log("MiniKit not available")
      }
    }

    loadMiniKit()

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const isAuthenticated = supabaseUser || farcasterUser
  const displayName =
    supabaseUser?.user_metadata?.username ||
    supabaseUser?.user_metadata?.display_name ||
    miniKitContext?.user?.displayName ||
    supabaseUser?.email?.split("@")[0] ||
    "User"

  const filteredNavItems = isAuthenticated
    ? navItems
    : navItems.filter((item) => !["create", "profile"].includes(item.href.slice(1)))

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2 pb-safe">
          {filteredNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === "/create" && pathname.startsWith("/create"))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  /* Improved mobile touch targets */
                  "flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-lg transition-all duration-200",
                  isActive ? "text-primary glow-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate max-w-[50px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
                <Swords className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <span className="hidden lg:inline">Meme Battle Arena</span>
                <span className="lg:hidden">MBA</span>
              </span>
            </Link>

            <div className="flex items-center gap-3 lg:gap-6">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href === "/create" && pathname.startsWith("/create"))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      /* Made navigation items more responsive */
                      "flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/10 neon-border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm lg:text-base hidden sm:inline">{item.label}</span>
                  </Link>
                )
              })}

              {!loading && (
                <>
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 text-sm"
                        >
                          <User className="h-4 w-4 mr-1 lg:mr-2" />
                          <span className="max-w-[80px] lg:max-w-none truncate">{displayName}</span>
                          {farcasterUser && <span className="ml-1 text-purple-400">🟣</span>}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-700">
                        <DropdownMenuItem asChild>
                          <Link
                            href="/profile"
                            className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button asChild className="bg-purple-600 hover:bg-purple-700">
                        <Link href="/auth/login">{miniKitContext ? "🟣 Sign In" : "Join Arena"}</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
