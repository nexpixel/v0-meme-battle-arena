import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

const VALID_REACTIONS = ["fire", "laugh", "mind_blown", "cringe", "based"] as const
type ReactionType = (typeof VALID_REACTIONS)[number]

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const memeId = params.id
    const { reactionType } = await request.json()

    if (!reactionType || !VALID_REACTIONS.includes(reactionType)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
    }

    // Check if meme exists
    const { data: meme, error: memeError } = await supabase.from("memes").select("id").eq("id", memeId).single()

    if (memeError || !meme) {
      return NextResponse.json({ error: "Meme not found" }, { status: 404 })
    }

    // Check if user already has this reaction on this meme
    const { data: existingReaction } = await supabase
      .from("reactions")
      .select("id")
      .eq("meme_id", memeId)
      .eq("user_id", user.id)
      .eq("reaction_type", reactionType)
      .single()

    if (existingReaction) {
      // Remove the reaction (toggle off)
      const { error: deleteError } = await supabase.from("reactions").delete().eq("id", existingReaction.id)

      if (deleteError) {
        return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 })
      }

      // Get updated reaction counts
      const { data: reactions } = await supabase.from("reactions").select("reaction_type").eq("meme_id", memeId)

      const reactionCounts = VALID_REACTIONS.reduce(
        (acc, type) => {
          acc[type] = reactions?.filter((r) => r.reaction_type === type).length || 0
          return acc
        },
        {} as Record<ReactionType, number>,
      )

      return NextResponse.json({
        success: true,
        action: "removed",
        reactionType,
        reactionCounts,
      })
    } else {
      // Add the reaction
      const { data: newReaction, error: insertError } = await supabase
        .from("reactions")
        .insert({
          meme_id: memeId,
          user_id: user.id,
          reaction_type: reactionType,
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
      }

      // Get updated reaction counts
      const { data: reactions } = await supabase.from("reactions").select("reaction_type").eq("meme_id", memeId)

      const reactionCounts = VALID_REACTIONS.reduce(
        (acc, type) => {
          acc[type] = reactions?.filter((r) => r.reaction_type === type).length || 0
          return acc
        },
        {} as Record<ReactionType, number>,
      )

      return NextResponse.json({
        success: true,
        action: "added",
        reactionType,
        reaction: newReaction,
        reactionCounts,
      })
    }
  } catch (error) {
    console.error("Reaction API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const memeId = params.id

    // Get all reactions for this meme
    const { data: reactions, error } = await supabase
      .from("reactions")
      .select("reaction_type, user_id")
      .eq("meme_id", memeId)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 })
    }

    // Count reactions by type
    const reactionCounts = VALID_REACTIONS.reduce(
      (acc, type) => {
        acc[type] = reactions?.filter((r) => r.reaction_type === type).length || 0
        return acc
      },
      {} as Record<ReactionType, number>,
    )

    // Get user's reactions if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    let userReactions: ReactionType[] = []

    if (user) {
      userReactions = reactions?.filter((r) => r.user_id === user.id).map((r) => r.reaction_type as ReactionType) || []
    }

    return NextResponse.json({
      reactionCounts,
      userReactions,
      totalReactions: reactions?.length || 0,
    })
  } catch (error) {
    console.error("Get reactions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
