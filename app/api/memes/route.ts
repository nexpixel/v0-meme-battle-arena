import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    let query = supabase.from("memes").select(`
        id,
        title,
        image_url,
        description,
        created_at,
        creator:profiles!memes_creator_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        ),
        reactions(reaction_type),
        votes(id)
      `)

    // Add search filter
    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data: memes, error } = await query

    if (error) {
      console.error("Memes fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch memes" }, { status: 500 })
    }

    // Process memes to include reaction counts and stats
    const processedMemes =
      memes?.map((meme) => {
        const reactionCounts = {
          fire: meme.reactions?.filter((r) => r.reaction_type === "fire").length || 0,
          laugh: meme.reactions?.filter((r) => r.reaction_type === "laugh").length || 0,
          mind_blown: meme.reactions?.filter((r) => r.reaction_type === "mind_blown").length || 0,
          cringe: meme.reactions?.filter((r) => r.reaction_type === "cringe").length || 0,
          based: meme.reactions?.filter((r) => r.reaction_type === "based").length || 0,
        }

        const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)
        const totalVotes = meme.votes?.length || 0

        return {
          id: meme.id,
          title: meme.title,
          imageUrl: meme.image_url,
          description: meme.description,
          createdAt: meme.created_at,
          creator: meme.creator,
          stats: {
            votes: totalVotes,
            reactions: totalReactions,
            battles: 0, // This would need a separate query to count battles
          },
          reactions: Object.entries(reactionCounts)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => ({ type, count })),
        }
      }) || []

    return NextResponse.json({
      memes: processedMemes,
      pagination: {
        page,
        limit,
        hasMore: memes?.length === limit,
      },
    })
  } catch (error) {
    console.error("Memes API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { title, imageUrl, description } = await request.json()

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image URL are required" }, { status: 400 })
    }

    // Create the meme
    const { data: meme, error: insertError } = await supabase
      .from("memes")
      .insert({
        title: title.trim(),
        image_url: imageUrl,
        description: description?.trim() || null,
        creator_id: user.id,
      })
      .select(`
        id,
        title,
        image_url,
        description,
        created_at,
        creator:profiles!memes_creator_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error("Meme creation error:", insertError)
      return NextResponse.json({ error: "Failed to create meme" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      meme: {
        ...meme,
        imageUrl: meme.image_url,
        createdAt: meme.created_at,
        stats: { votes: 0, reactions: 0, battles: 0 },
        reactions: [],
      },
    })
  } catch (error) {
    console.error("Create meme API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
