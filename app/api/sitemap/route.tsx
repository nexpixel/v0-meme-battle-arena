import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { data: battles } = await supabase
      .from("battles")
      .select("id, updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(100)

    const { data: memes } = await supabase
      .from("memes")
      .select("id, updated_at")
      .order("created_at", { ascending: false })
      .limit(100)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://meme-battle-arena.vercel.app"

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/battles</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/memes</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/leaderboard</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  ${
    battles
      ?.map(
        (battle) => `
  <url>
    <loc>${baseUrl}/battles/${battle.id}</loc>
    <lastmod>${battle.updated_at}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.6</priority>
  </url>`,
      )
      .join("") || ""
  }
  ${
    memes
      ?.map(
        (meme) => `
  <url>
    <loc>${baseUrl}/memes/${meme.id}</loc>
    <lastmod>${meme.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`,
      )
      .join("") || ""
  }
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Sitemap generation error:", error)
    return NextResponse.json({ error: "Failed to generate sitemap" }, { status: 500 })
  }
}
