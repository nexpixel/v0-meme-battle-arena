import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { data: expiredBattles, error: fetchError } = await supabase
      .from("battles")
      .select("id")
      .eq("status", "active")
      .lt("ends_at", new Date().toISOString())

    if (fetchError) {
      console.error("Error fetching expired battles:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (expiredBattles && expiredBattles.length > 0) {
      const { error: updateError } = await supabase
        .from("battles")
        .update({ status: "completed" })
        .in(
          "id",
          expiredBattles.map((battle) => battle.id),
        )

      if (updateError) {
        console.error("Error updating battle status:", updateError)
        return NextResponse.json({ error: "Update failed" }, { status: 500 })
      }

      console.log(`Updated ${expiredBattles.length} expired battles to completed status`)
    }

    return NextResponse.json({
      success: true,
      updated: expiredBattles?.length || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
