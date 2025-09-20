import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { battleId, memeId } = await request.json()

    if (!battleId || !memeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if battle exists and is active
    const { data: battle, error: battleError } = await supabase
      .from("battles")
      .select("id, status, ends_at, meme_a_id, meme_b_id")
      .eq("id", battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 })
    }

    if (battle.status !== "active") {
      return NextResponse.json({ error: "Battle is not active" }, { status: 400 })
    }

    // Check if battle has ended
    if (battle.ends_at && new Date(battle.ends_at) < new Date()) {
      return NextResponse.json({ error: "Battle has ended" }, { status: 400 })
    }

    // Validate meme is part of this battle
    if (memeId !== battle.meme_a_id && memeId !== battle.meme_b_id) {
      return NextResponse.json({ error: "Invalid meme for this battle" }, { status: 400 })
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("battle_id", battleId)
      .eq("voter_id", user.id)
      .single()

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted in this battle" }, { status: 400 })
    }

    // Create the vote
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .insert({
        battle_id: battleId,
        voter_id: user.id,
        meme_id: memeId,
      })
      .select()
      .single()

    if (voteError) {
      console.error("Vote creation error:", voteError)
      return NextResponse.json({ error: "Failed to create vote" }, { status: 500 })
    }

    // Get updated vote counts
    const { data: votes } = await supabase.from("votes").select("meme_id").eq("battle_id", battleId)

    const memeAVotes = votes?.filter((v) => v.meme_id === battle.meme_a_id).length || 0
    const memeBVotes = votes?.filter((v) => v.meme_id === battle.meme_b_id).length || 0

    return NextResponse.json({
      success: true,
      vote,
      voteCounts: {
        memeA: memeAVotes,
        memeB: memeBVotes,
        total: memeAVotes + memeBVotes,
      },
    })
  } catch (error) {
    console.error("Vote API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
