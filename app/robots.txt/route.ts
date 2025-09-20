import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://meme-battle-arena.vercel.app"

  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow auth pages from indexing
Disallow: /auth/
Disallow: /api/

# Allow important pages
Allow: /
Allow: /battles
Allow: /memes
Allow: /leaderboard`

  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
