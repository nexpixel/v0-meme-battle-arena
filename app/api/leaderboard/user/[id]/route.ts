import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const userId = params.id

    // Get user's leaderboard entry and rank
    const { data: userEntry, error } = await supabase
      .from("leaderboard_entries")
      .select(`
        *,
        user:profiles!leaderboard_entries_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .single()

    if (error || !userEntry) {
      return NextResponse.json({ error: "User not found in leaderboard" }, { status: 404 })
    }

    // Get user's rank by counting users with higher scores
    const { count: higherScoreCount, error: rankError } = await supabase
      .from("leaderboard_entries")
      .select("*", { count: "exact", head: true })
      .gt("score", userEntry.score)

    if (rankError) {
      console.error("Rank calculation error:", rankError)
      return NextResponse.json({ error: "Failed to calculate rank" }, { status: 500 })
    }

    const rank = (higherScoreCount || 0) + 1

    // Get user's recent activity
    const { data: recentMemes } = await supabase
      .from("memes")
      .select("id, title, image_url, created_at")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    const { data: recentVotes } = await supabase
      .from("votes")
      .select(`
        id,
        created_at,
        battle:battles!votes_battle_id_fkey(
          id,
          title
        )
      `)
      .eq("voter_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    return NextResponse.json({
      user: userEntry.user,
      stats: {
        score: userEntry.score,
        totalVotesReceived: userEntry.total_votes_received,
        totalBattlesWon: userEntry.total_battles_won,
        totalMemesCreated: userEntry.total_memes_created,
        totalReactionsReceived: userEntry.total_reactions_received,
        rank,
      },
      recentActivity: {
        memes: recentMemes || [],
        votes: recentVotes || [],
      },
    })
  } catch (error) {
    console.error("User leaderboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
