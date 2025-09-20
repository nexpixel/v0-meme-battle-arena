"use client"

import { useState, useEffect } from "react"
import { MemeCard } from "@/components/ui/meme-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, Plus, TrendingUp, Clock, Flame } from "lucide-react"

interface Meme {
  id: string
  title: string
  imageUrl: string
  description?: string
  creator: {
    id: string
    username: string
    displayName?: string
    avatarUrl?: string
  }
  stats: {
    votes: number
    reactions: number
    battles: number
  }
  reactions: Array<{
    type: "fire" | "laugh" | "mind_blown" | "cringe" | "based"
    count: number
  }>
  createdAt: string
}

export default function MemesPage() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchMemes(true)
  }, [searchQuery, sortBy])

  const fetchMemes = async (reset = false) => {
    setIsLoading(true)

    try {
      const currentPage = reset ? 1 : page
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchQuery,
        sortBy: sortBy,
        sortOrder: "desc",
      })

      const response = await fetch(`/api/memes?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (reset) {
          setMemes(data.memes)
          setPage(1)
        } else {
          setMemes((prev) => [...prev, ...data.memes])
        }
        setHasMore(data.pagination.hasMore)
        if (!reset) setPage((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error fetching memes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchMemes(false)
    }
  }

  const sortOptions = [
    { value: "created_at", label: "Latest", icon: Clock },
    { value: "reactions", label: "Most Reactions", icon: Flame },
    { value: "votes", label: "Most Voted", icon: TrendingUp },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Meme Gallery
          </h1>
          <p className="text-muted-foreground mt-1">Discover epic memes from the community</p>
        </div>

        <Button asChild className="glow-primary">
          <Link href="/create/meme">
            <Plus className="h-4 w-4 mr-2" />
            Create Meme
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search memes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border focus:border-primary"
              />
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              {sortOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(option.value)}
                    className={sortBy === option.value ? "glow-primary" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center hover:glow-primary transition-all duration-300">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{memes.length}</div>
            <div className="text-sm text-muted-foreground">Memes Loaded</div>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-secondary transition-all duration-300">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {memes.reduce((sum, meme) => sum + meme.stats.reactions, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Reactions</div>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-accent transition-all duration-300">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {memes.reduce((sum, meme) => sum + meme.stats.votes, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Votes</div>
          </CardContent>
        </Card>
      </div>

      {/* Memes Grid */}
      {memes.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {memes.map((meme) => (
              <MemeCard
                key={meme.id}
                id={meme.id}
                title={meme.title}
                imageUrl={meme.imageUrl}
                description={meme.description}
                creator={meme.creator}
                stats={meme.stats}
                reactions={meme.reactions}
                showActions={true}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button onClick={handleLoadMore} disabled={isLoading} variant="outline" size="lg">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More Memes"
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{searchQuery ? "No memes found" : "No memes yet"}</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Be the first to create an epic meme!"}
              </p>
            </div>
            <Button asChild className="glow-primary">
              <Link href="/create/meme">
                <Plus className="h-4 w-4 mr-2" />
                Create First Meme
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && memes.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
