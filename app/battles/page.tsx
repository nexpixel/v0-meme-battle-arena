import { createClient } from "@/lib/supabase/server"
import { BattleCard } from "@/components/ui/battle-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Filter, Clock, Trophy } from "lucide-react"

async function getBattles() {
  const supabase = await createClient()

  const { data: battles, error } = await supabase
    .from("battles")
    .select(`
      *,
      meme_a:memes!battles_meme_a_id_fkey(
        id,
        title,
        image_url,
        creator:profiles!memes_creator_id_fkey(username, display_name)
      ),
      meme_b:memes!battles_meme_b_id_fkey(
        id,
        title,
        image_url,
        creator:profiles!memes_creator_id_fkey(username, display_name)
      ),
      votes(meme_id)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching battles:", error)
    return []
  }

  // Process battles to include vote counts
  const processedBattles =
    battles?.map((battle) => {
      const memeAVotes = battle.votes?.filter((v) => v.meme_id === battle.meme_a_id).length || 0
      const memeBVotes = battle.votes?.filter((v) => v.meme_id === battle.meme_b_id).length || 0
      const totalVotes = memeAVotes + memeBVotes

      return {
        ...battle,
        memeA: {
          ...battle.meme_a,
          votes: memeAVotes,
        },
        memeB: {
          ...battle.meme_b,
          votes: memeBVotes,
        },
        totalVotes,
      }
    }) || []

  return processedBattles
}

async function getUserVotes(userId: string) {
  const supabase = await createClient()

  const { data: votes } = await supabase.from("votes").select("battle_id, meme_id").eq("voter_id", userId)

  return votes || []
}

export default async function BattlesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const battles = await getBattles()
  const userVotes = user ? await getUserVotes(user.id) : []

  const userVoteMap = userVotes.reduce(
    (acc, vote) => {
      acc[vote.battle_id] = vote.meme_id
      return acc
    },
    {} as Record<string, string>,
  )

  const activeBattles = battles.filter((b) => b.status === "active")
  const completedBattles = battles.filter((b) => b.status === "completed")

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Battle Arena
          </h1>
          <p className="text-muted-foreground mt-1">Vote in epic meme battles and watch the chaos unfold</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          {user && (
            <Button asChild className="glow-primary">
              <Link href="/create/battle">
                <Plus className="h-4 w-4 mr-2" />
                Create Battle
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center hover:glow-primary transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <Badge variant="secondary">Live</Badge>
            </div>
            <div className="text-2xl font-bold text-primary">{activeBattles.length}</div>
            <div className="text-sm text-muted-foreground">Active Battles</div>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-secondary transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-secondary" />
              <Badge variant="outline">Complete</Badge>
            </div>
            <div className="text-2xl font-bold text-secondary">{completedBattles.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-accent transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-5 h-5 bg-accent rounded-full" />
              <Badge variant="destructive">Total</Badge>
            </div>
            <div className="text-2xl font-bold text-accent">{battles.reduce((sum, b) => sum + b.totalVotes, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Votes</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Battles */}
      {activeBattles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Active Battles</h2>
            <Badge variant="secondary" className="glow-secondary">
              {activeBattles.length} Live
            </Badge>
          </div>

          <div className="grid gap-6">
            {activeBattles.map((battle) => (
              <BattleCard
                key={battle.id}
                id={battle.id}
                title={battle.title}
                description={battle.description}
                status={battle.status}
                endsAt={battle.ends_at}
                memeA={{
                  id: battle.meme_a.id,
                  title: battle.meme_a.title,
                  imageUrl: battle.meme_a.image_url,
                  creator: battle.meme_a.creator,
                  votes: battle.memeA.votes,
                }}
                memeB={{
                  id: battle.meme_b.id,
                  title: battle.meme_b.title,
                  imageUrl: battle.meme_b.image_url,
                  creator: battle.meme_b.creator,
                  votes: battle.memeB.votes,
                }}
                totalVotes={battle.totalVotes}
                userVote={userVoteMap[battle.id]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Battles */}
      {completedBattles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-secondary" />
            <h2 className="text-2xl font-bold">Completed Battles</h2>
            <Badge variant="outline">{completedBattles.length} Finished</Badge>
          </div>

          <div className="grid gap-6">
            {completedBattles.slice(0, 5).map((battle) => (
              <BattleCard
                key={battle.id}
                id={battle.id}
                title={battle.title}
                description={battle.description}
                status={battle.status}
                endsAt={battle.ends_at}
                memeA={{
                  id: battle.meme_a.id,
                  title: battle.meme_a.title,
                  imageUrl: battle.meme_a.image_url,
                  creator: battle.meme_a.creator,
                  votes: battle.memeA.votes,
                }}
                memeB={{
                  id: battle.meme_b.id,
                  title: battle.meme_b.title,
                  imageUrl: battle.meme_b.image_url,
                  creator: battle.meme_b.creator,
                  votes: battle.memeB.votes,
                }}
                totalVotes={battle.totalVotes}
                userVote={userVoteMap[battle.id]}
              />
            ))}
          </div>

          {completedBattles.length > 5 && (
            <div className="text-center">
              <Button variant="outline">Load More Completed Battles</Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {battles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No battles yet</h3>
              <p className="text-muted-foreground">Be the first to create an epic meme battle!</p>
            </div>
            {user && (
              <Button asChild className="glow-primary">
                <Link href="/create/battle">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Battle
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
