"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MemeCard } from "@/components/ui/meme-card"
import { Trophy, Target, Zap, Calendar, TrendingUp, Settings, LogOut, Crown } from "lucide-react"

interface UserProfile {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
}

interface UserStats {
  score: number
  totalVotesReceived: number
  totalBattlesWon: number
  totalMemesCreated: number
  totalReactionsReceived: number
  rank: number
}

interface RecentMeme {
  id: string
  title: string
  image_url: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentMemes, setRecentMemes] = useState<RecentMeme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      router.push("/auth/login")
      return
    }

    setUser(user)
    await fetchUserData(user.id)
  }

  const fetchUserData = async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      setProfile({
        id: profileData.id,
        username: profileData.username,
        displayName: profileData.display_name,
        avatarUrl: profileData.avatar_url,
        createdAt: profileData.created_at,
      })

      // Fetch user stats from API
      const response = await fetch(`/api/leaderboard/user/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentMemes(data.recentActivity.memes)
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error)
      setError(error.message || "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500 text-black font-bold">
          <Crown className="h-3 w-3 mr-1" />
          Champion
        </Badge>
      )
    } else if (rank <= 3) {
      return (
        <Badge variant="secondary">
          <Trophy className="h-3 w-3 mr-1" />
          Top 3
        </Badge>
      )
    } else if (rank <= 10) {
      return (
        <Badge variant="outline">
          <TrendingUp className="h-3 w-3 mr-1" />
          Top 10
        </Badge>
      )
    } else {
      return <Badge variant="outline">#{rank}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-4">{error || "Profile not found"}</p>
            <Button onClick={() => fetchUserData(user?.id)} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <Card className="neon-border-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.displayName || profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {stats && (
                <div className="flex items-center gap-4">
                  {getRankBadge(stats.rank)}
                  <Badge variant="outline" className="text-primary">
                    {stats.score.toLocaleString()} points
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center hover:glow-primary transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">#{stats.rank}</div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </CardContent>
          </Card>

          <Card className="text-center hover:glow-secondary transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-secondary">{stats.totalVotesReceived}</div>
              <div className="text-sm text-muted-foreground">Votes Received</div>
            </CardContent>
          </Card>

          <Card className="text-center hover:glow-accent transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div className="text-2xl font-bold text-accent">{stats.totalBattlesWon}</div>
              <div className="text-sm text-muted-foreground">Battles Won</div>
            </CardContent>
          </Card>

          <Card className="text-center hover:glow-primary transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{stats.totalMemesCreated}</div>
              <div className="text-sm text-muted-foreground">Memes Created</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Memes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Recent Memes
            <Badge variant="outline" className="ml-auto">
              {recentMemes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentMemes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMemes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  id={meme.id}
                  title={meme.title}
                  imageUrl={meme.image_url}
                  creator={{
                    username: profile.username,
                    displayName: profile.displayName,
                  }}
                  stats={{ votes: 0, reactions: 0, battles: 0 }}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No memes yet</h3>
              <p className="text-muted-foreground mb-4">Start creating epic memes to build your reputation!</p>
              <Button asChild className="glow-primary">
                <a href="/create/meme">
                  <Zap className="h-4 w-4 mr-2" />
                  Create Your First Meme
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-secondary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats && stats.totalMemesCreated >= 1 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">First Meme</div>
                  <div className="text-sm text-muted-foreground">Created your first meme</div>
                </div>
              </div>
            )}

            {stats && stats.totalVotesReceived >= 10 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="font-medium">Popular Creator</div>
                  <div className="text-sm text-muted-foreground">Received 10+ votes</div>
                </div>
              </div>
            )}

            {stats && stats.totalBattlesWon >= 1 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium">Battle Winner</div>
                  <div className="text-sm text-muted-foreground">Won your first battle</div>
                </div>
              </div>
            )}

            {stats && stats.rank <= 10 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="font-medium">Elite Warrior</div>
                  <div className="text-sm text-muted-foreground">Reached top 10</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
