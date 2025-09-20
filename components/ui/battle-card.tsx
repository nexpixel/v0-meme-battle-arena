"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MemeCard } from "./meme-card"
import { ShareButton } from "./share-button"
import { cn } from "@/lib/utils"
import { Clock, Users, Trophy, Loader2 } from "lucide-react"

interface BattleCardProps {
  id: string
  title: string
  description?: string
  status: "active" | "completed" | "cancelled"
  endsAt?: string
  memeA: {
    id: string
    title: string
    imageUrl: string
    creator: {
      username: string
      displayName?: string
    }
    votes: number
  }
  memeB: {
    id: string
    title: string
    imageUrl: string
    creator: {
      username: string
      displayName?: string
    }
    votes: number
  }
  totalVotes: number
  userVote?: string
  onVote?: (memeId: string) => void
  className?: string
}

export function BattleCard({
  id,
  title,
  description,
  status,
  endsAt,
  memeA,
  memeB,
  totalVotes,
  userVote,
  onVote,
  className,
}: BattleCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isVoting, setIsVoting] = useState(false)
  const [localUserVote, setLocalUserVote] = useState(userVote)
  const [localVoteCounts, setLocalVoteCounts] = useState({
    memeA: memeA.votes,
    memeB: memeB.votes,
    total: totalVotes,
  })

  useEffect(() => {
    if (!endsAt || status !== "active") return

    const updateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endsAt).getTime()
      const difference = end - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft("Ended")
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000)

    return () => clearInterval(interval)
  }, [endsAt, status])

  const handleVote = async (memeId: string) => {
    if (localUserVote || isVoting) return

    setIsVoting(true)

    try {
      const response = await fetch("/api/battles/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          battleId: id,
          memeId: memeId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLocalUserVote(memeId)
        setLocalVoteCounts({
          memeA: data.voteCounts.memeA,
          memeB: data.voteCounts.memeB,
          total: data.voteCounts.total,
        })
        onVote?.(memeId)
      } else {
        console.error("Vote failed:", data.error)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Vote error:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const memeAPercentage = localVoteCounts.total > 0 ? (localVoteCounts.memeA / localVoteCounts.total) * 100 : 0
  const memeBPercentage = localVoteCounts.total > 0 ? (localVoteCounts.memeB / localVoteCounts.total) * 100 : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary text-secondary-foreground"
      case "completed":
        return "bg-primary text-primary-foreground"
      case "cancelled":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        "hover:glow-primary border-border hover:border-primary/50",
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl text-balance">{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>

            {status === "active" && timeLeft && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {timeLeft}
              </div>
            )}
          </div>
        </div>

        {/* Battle Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {localVoteCounts.total} votes
            </div>

            {status === "completed" && (
              <div className="flex items-center gap-1 text-primary">
                <Trophy className="h-4 w-4" />
                Battle Complete
              </div>
            )}
          </div>

          <ShareButton
            title={title}
            url={`/battles/${id}`}
            text={`Epic meme battle: ${title} - ${memeA.creator.username} vs ${memeB.creator.username}! Vote now!`}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Battle Progress */}
        {localVoteCounts.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary truncate max-w-[45%]">
                {memeA.creator.username}: {localVoteCounts.memeA} ({Math.round(memeAPercentage)}%)
              </span>
              <span className="text-accent truncate max-w-[45%]">
                {memeB.creator.username}: {localVoteCounts.memeB} ({Math.round(memeBPercentage)}%)
              </span>
            </div>

            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-secondary transition-all duration-500"
                style={{ width: `${memeAPercentage}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-accent transition-all duration-500"
                style={{ width: `${memeBPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Meme Battle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Meme A */}
          <div className="space-y-3">
            <div className="relative">
              <MemeCard
                id={memeA.id}
                title={memeA.title}
                imageUrl={memeA.imageUrl}
                creator={memeA.creator}
                stats={{ votes: localVoteCounts.memeA, reactions: 0, battles: 0 }}
                showActions={false}
                className={cn(
                  "transition-all duration-300",
                  localUserVote === memeA.id && "neon-border-secondary glow-secondary",
                )}
              />

              {status === "active" && (
                <Button
                  className={cn(
                    "w-full mt-3 transition-all duration-300 text-sm sm:text-base",
                    localUserVote === memeA.id
                      ? "bg-secondary text-secondary-foreground glow-secondary"
                      : "hover:glow-secondary",
                  )}
                  variant={localUserVote === memeA.id ? "default" : "outline"}
                  onClick={() => handleVote(memeA.id)}
                  disabled={!!localUserVote || isVoting}
                >
                  {isVoting && localUserVote !== memeA.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Voting...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : localUserVote === memeA.id ? (
                    "Voted!"
                  ) : (
                    <>
                      <span className="hidden sm:inline">Vote for this meme</span>
                      <span className="sm:hidden">Vote</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* VS Divider */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center glow-primary">
              <span className="text-primary-foreground font-bold text-lg">VS</span>
            </div>
          </div>

          {/* Mobile VS Divider */}
          <div className="lg:hidden flex items-center justify-center py-2">
            <div className="w-16 h-8 rounded-full bg-primary flex items-center justify-center glow-primary">
              <span className="text-primary-foreground font-bold">VS</span>
            </div>
          </div>

          {/* Meme B */}
          <div className="space-y-3">
            <div className="relative">
              <MemeCard
                id={memeB.id}
                title={memeB.title}
                imageUrl={memeB.imageUrl}
                creator={memeB.creator}
                stats={{ votes: localVoteCounts.memeB, reactions: 0, battles: 0 }}
                showActions={false}
                className={cn(
                  "transition-all duration-300",
                  localUserVote === memeB.id && "neon-border-accent glow-accent",
                )}
              />

              {status === "active" && (
                <Button
                  className={cn(
                    "w-full mt-3 transition-all duration-300 text-sm sm:text-base",
                    localUserVote === memeB.id ? "bg-accent text-accent-foreground glow-accent" : "hover:glow-accent",
                  )}
                  variant={localUserVote === memeB.id ? "default" : "outline"}
                  onClick={() => handleVote(memeB.id)}
                  disabled={!!localUserVote || isVoting}
                >
                  {isVoting && localUserVote !== memeB.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Voting...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : localUserVote === memeB.id ? (
                    "Voted!"
                  ) : (
                    <>
                      <span className="hidden sm:inline">Vote for this meme</span>
                      <span className="sm:hidden">Vote</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
