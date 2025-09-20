import { createClient } from "@/lib/supabase/server"
import { LeaderboardCard } from "@/components/ui/leaderboard-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Award, TrendingUp, Users, Zap, Target } from "lucide-react"

async function getLeaderboard() {
  const supabase = await createClient()

  const { data: leaderboard, error } = await supabase.rpc("get_leaderboard", { limit_count: 50 })

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }

  return leaderboard || []
}

async function getLeaderboardStats() {
  const supabase = await createClient()

  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { data: totalStats } = await supabase
    .from("leaderboard_entries")
    .select("score, total_votes_received, total_battles_won, total_memes_created")

  const stats = {
    totalUsers: totalUsers || 0,
    totalScore: totalStats?.reduce((sum, entry) => sum + entry.score, 0) || 0,
    totalVotes: totalStats?.reduce((sum, entry) => sum + entry.total_votes_received, 0) || 0,
    totalBattles: totalStats?.reduce((sum, entry) => sum + entry.total_battles_won, 0) || 0,
    totalMemes: totalStats?.reduce((sum, entry) => sum + entry.total_memes_created, 0) || 0,
  }

  return stats
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard()
  const stats = await getLeaderboardStats()

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="h-8 w-8 text-primary glow-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Hall of Fame
          </h1>
          <Trophy className="h-8 w-8 text-primary glow-primary" />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The ultimate warriors who dominate the meme battle arena
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center hover:glow-primary transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Warriors</div>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-secondary transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-secondary">{stats.totalVotes.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Votes</div>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-accent transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">{stats.totalBattles.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Battles Won</div>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-primary transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{stats.totalMemes.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Memes Created</div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <Card className="cyber-gradient neon-border-primary">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Champions Podium
              <Crown className="h-6 w-6 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-1 md:order-1">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2 glow-secondary">
                      <Medal className="h-8 w-8 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      2nd Place
                    </Badge>
                  </div>
                  <LeaderboardCard
                    rank={2}
                    user={{
                      id: topThree[1].user_id,
                      username: topThree[1].username,
                      displayName: topThree[1].display_name,
                      avatarUrl: topThree[1].avatar_url,
                    }}
                    stats={{
                      score: topThree[1].score,
                      totalVotesReceived: topThree[1].total_votes_received,
                      totalBattlesWon: topThree[1].total_battles_won,
                      totalMemesCreated: topThree[1].total_memes_created,
                      totalReactionsReceived: topThree[1].total_reactions_received,
                    }}
                  />
                </div>
              )}

              {/* 1st Place */}
              <div className="order-2 md:order-2">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 glow-accent">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <Badge className="text-xl px-6 py-2 bg-yellow-500 text-black font-bold">Champion</Badge>
                </div>
                <LeaderboardCard
                  rank={1}
                  user={{
                    id: topThree[0].user_id,
                    username: topThree[0].username,
                    displayName: topThree[0].display_name,
                    avatarUrl: topThree[0].avatar_url,
                  }}
                  stats={{
                    score: topThree[0].score,
                    totalVotesReceived: topThree[0].total_votes_received,
                    totalBattlesWon: topThree[0].total_battles_won,
                    totalMemesCreated: topThree[0].total_memes_created,
                    totalReactionsReceived: topThree[0].total_reactions_received,
                  }}
                />
              </div>

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 md:order-3">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-1 border-amber-600 text-amber-600">
                      3rd Place
                    </Badge>
                  </div>
                  <LeaderboardCard
                    rank={3}
                    user={{
                      id: topThree[2].user_id,
                      username: topThree[2].username,
                      displayName: topThree[2].display_name,
                      avatarUrl: topThree[2].avatar_url,
                    }}
                    stats={{
                      score: topThree[2].score,
                      totalVotesReceived: topThree[2].total_votes_received,
                      totalBattlesWon: topThree[2].total_battles_won,
                      totalMemesCreated: topThree[2].total_memes_created,
                      totalReactionsReceived: topThree[2].total_reactions_received,
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Full Rankings
            <Badge variant="outline" className="ml-auto">
              {leaderboard.length} Warriors
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {restOfLeaderboard.length > 0 ? (
            <div className="space-y-3">
              {restOfLeaderboard.map((entry, index) => (
                <LeaderboardCard
                  key={entry.user_id}
                  rank={index + 4} // +4 because we skip top 3
                  user={{
                    id: entry.user_id,
                    username: entry.username,
                    displayName: entry.display_name,
                    avatarUrl: entry.avatar_url,
                  }}
                  stats={{
                    score: entry.score,
                    totalVotesReceived: entry.total_votes_received,
                    totalBattlesWon: entry.total_battles_won,
                    totalMemesCreated: entry.total_memes_created,
                    totalReactionsReceived: entry.total_reactions_received,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
              <p className="text-muted-foreground">Start creating memes and battling to appear on the leaderboard!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-secondary" />
            How Scoring Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <div className="font-medium">Votes Received</div>
                <div className="text-muted-foreground">2 points each</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">Battles Won</div>
                <div className="text-muted-foreground">10 points each</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="font-medium">Memes Created</div>
                <div className="text-muted-foreground">1 point each</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Medal className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="font-medium">Reactions Received</div>
                <div className="text-muted-foreground">1 point each</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
