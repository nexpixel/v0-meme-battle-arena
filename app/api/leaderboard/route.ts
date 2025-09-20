import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const timeframe = searchParams.get("timeframe") || "all_time"

    // Get leaderboard data using the database function
    const { data: leaderboard, error } = await supabase.rpc("get_leaderboard", { limit_count: limit })

    if (error) {
      console.error("Leaderboard fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    // If timeframe filtering is needed, we can add date filters here
    const filteredLeaderboard = leaderboard || []

    if (timeframe !== "all_time") {
      // For now, we'll return all data since we don't have time-based filtering in the function
      // In a real implementation, you'd modify the database function to accept date parameters
    }

    return NextResponse.json({
      leaderboard: filteredLeaderboard,
      timeframe,
      totalUsers: filteredLeaderboard.length,
    })
  } catch (error) {
    console.error("Leaderboard API error:", error)
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

    const { userId } = await request.json()
    const targetUserId = userId || user.id

    // Update leaderboard score for the specified user
    const { error } = await supabase.rpc("update_leaderboard_score", { user_uuid: targetUserId })

    if (error) {
      console.error("Score update error:", error)
      return NextResponse.json({ error: "Failed to update score" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update leaderboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
