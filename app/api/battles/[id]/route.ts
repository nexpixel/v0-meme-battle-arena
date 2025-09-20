import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const battleId = params.id

    // Get battle with memes and vote counts
    const { data: battle, error } = await supabase
      .from("battles")
      .select(`
        *,
        meme_a:memes!battles_meme_a_id_fkey(
          id,
          title,
          image_url,
          creator:profiles!memes_creator_id_fkey(username, display_name, avatar_url)
        ),
        meme_b:memes!battles_meme_b_id_fkey(
          id,
          title,
          image_url,
          creator:profiles!memes_creator_id_fkey(username, display_name, avatar_url)
        ),
        votes(meme_id, voter_id),
        creator:profiles!battles_creator_id_fkey(username, display_name)
      `)
      .eq("id", battleId)
      .single()

    if (error || !battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 })
    }

    // Process vote counts
    const memeAVotes = battle.votes?.filter((v) => v.meme_id === battle.meme_a_id).length || 0
    const memeBVotes = battle.votes?.filter((v) => v.meme_id === battle.meme_b_id).length || 0
    const totalVotes = memeAVotes + memeBVotes

    // Get user's vote if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    let userVote = null

    if (user) {
      const userVoteData = battle.votes?.find((v) => v.voter_id === user.id)
      userVote = userVoteData?.meme_id || null
    }

    const processedBattle = {
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
      userVote,
    }

    return NextResponse.json(processedBattle)
  } catch (error) {
    console.error("Battle fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const battleId = params.id
    const { status } = await request.json()

    // Verify user owns this battle
    const { data: battle, error: battleError } = await supabase
      .from("battles")
      .select("creator_id")
      .eq("id", battleId)
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 })
    }

    if (battle.creator_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to modify this battle" }, { status: 403 })
    }

    // Update battle status
    const { data: updatedBattle, error: updateError } = await supabase
      .from("battles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", battleId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update battle" }, { status: 500 })
    }

    return NextResponse.json(updatedBattle)
  } catch (error) {
    console.error("Battle update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
