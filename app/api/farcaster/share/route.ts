import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { battleId, memeId, text } = await request.json()

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error: logError } = await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: "farcaster_share",
      metadata: {
        battle_id: battleId,
        meme_id: memeId,
        shared_text: text,
        timestamp: new Date().toISOString(),
      },
    })

    if (logError) {
      console.error("Failed to log Farcaster share:", logError)
    }

    return NextResponse.json({
      success: true,
      message: "Share activity logged successfully",
    })
  } catch (error) {
    console.error("Farcaster share API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
