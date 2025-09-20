"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Heart, MessageCircle, Share2, Flame, Laugh, Brain, Frown, ThumbsUp, Loader2 } from "lucide-react"

interface MemeCardProps {
  id: string
  title: string
  imageUrl: string
  description?: string
  creator: {
    username: string
    displayName?: string
    avatarUrl?: string
  }
  stats: {
    votes: number
    reactions: number
    battles: number
  }
  reactions?: Array<{
    type: "fire" | "laugh" | "mind_blown" | "cringe" | "based"
    count: number
  }>
  className?: string
  showActions?: boolean
  onVote?: () => void
  onReact?: (type: string) => void
  onShare?: () => void
}

const reactionIcons = {
  fire: Flame,
  laugh: Laugh,
  mind_blown: Brain,
  cringe: Frown,
  based: ThumbsUp,
}

const reactionColors = {
  fire: "text-orange-500 hover:text-orange-400",
  laugh: "text-yellow-500 hover:text-yellow-400",
  mind_blown: "text-purple-500 hover:text-purple-400",
  cringe: "text-red-500 hover:text-red-400",
  based: "text-green-500 hover:text-green-400",
}

const reactionLabels = {
  fire: "Fire",
  laugh: "Laugh",
  mind_blown: "Mind Blown",
  cringe: "Cringe",
  based: "Based",
}

export function MemeCard({
  id,
  title,
  imageUrl,
  description,
  creator,
  stats,
  reactions = [],
  className,
  showActions = true,
  onVote,
  onReact,
  onShare,
}: MemeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [localReactions, setLocalReactions] = useState(reactions)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [isReacting, setIsReacting] = useState(false)

  useEffect(() => {
    if (showActions) {
      fetchReactions()
    }
  }, [id, showActions])

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/memes/${id}/react`)
      if (response.ok) {
        const data = await response.json()

        // Convert reaction counts to the format expected by the component
        const formattedReactions = Object.entries(data.reactionCounts)
          .filter(([_, count]) => (count as number) > 0)
          .map(([type, count]) => ({ type: type as any, count: count as number }))

        setLocalReactions(formattedReactions)
        setUserReactions(data.userReactions || [])
      }
    } catch (error) {
      console.error("Error fetching reactions:", error)
    }
  }

  const handleReaction = async (reactionType: string) => {
    if (isReacting) return

    setIsReacting(true)

    try {
      const response = await fetch(`/api/memes/${id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reactionType }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update local state
        const formattedReactions = Object.entries(data.reactionCounts)
          .filter(([_, count]) => (count as number) > 0)
          .map(([type, count]) => ({ type: type as any, count: count as number }))

        setLocalReactions(formattedReactions)

        // Update user reactions
        if (data.action === "added") {
          setUserReactions((prev) => [...prev, reactionType])
        } else {
          setUserReactions((prev) => prev.filter((r) => r !== reactionType))
        }

        setShowReactions(false)
        onReact?.(reactionType)
      }
    } catch (error) {
      console.error("Error reacting:", error)
    } finally {
      setIsReacting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this epic meme: ${title}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        // You could show a toast notification here
      } catch (error) {
        console.error("Error copying to clipboard:", error)
      }
    }
    onShare?.()
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:glow-primary",
        "bg-card border-border hover:border-primary/50 neon-border-primary",
        className,
      )}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              "group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Creator Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm cyber-text">
              @{creator.username}
            </Badge>
          </div>

          {/* Stats Overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
              {stats.votes} VOTES
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-balance leading-tight cyber-text line-clamp-2">
              {title}
            </h3>
            {description && <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
          </div>

          {/* Reactions */}
          {localReactions.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {localReactions.map((reaction) => {
                const Icon = reactionIcons[reaction.type]
                const colorClass = reactionColors[reaction.type]
                const isUserReaction = userReactions.includes(reaction.type)

                return (
                  <Button
                    key={reaction.type}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      /* Made reaction buttons more mobile-friendly */
                      "h-7 sm:h-8 px-1.5 sm:px-2 gap-1 hover:bg-muted/50 transition-all duration-200 text-xs",
                      colorClass,
                      isUserReaction && "bg-primary/10 ring-1 ring-primary/20",
                    )}
                    onClick={() => handleReaction(reaction.type)}
                    disabled={isReacting}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs">{reaction.count}</span>
                  </Button>
                )
              })}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 sm:gap-2 hover:text-primary hover:glow-primary text-xs sm:text-sm px-2 sm:px-3"
                  onClick={onVote}
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Vote</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 sm:gap-2 hover:text-secondary text-xs sm:text-sm px-2 sm:px-3"
                  onClick={() => setShowReactions(!showReactions)}
                  disabled={isReacting}
                >
                  {isReacting ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline">React</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1 sm:gap-2 hover:text-accent text-xs sm:text-sm px-2 sm:px-3"
                onClick={handleShare}
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
              {Object.entries(reactionIcons).map(([type, Icon]) => {
                const isUserReaction = userReactions.includes(type)
                const colorClass = reactionColors[type as keyof typeof reactionColors]

                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 w-10 p-0 hover:scale-110 transition-all duration-200",
                      colorClass,
                      isUserReaction && "bg-primary/20 ring-2 ring-primary/30",
                    )}
                    onClick={() => handleReaction(type)}
                    disabled={isReacting}
                    title={reactionLabels[type as keyof typeof reactionLabels]}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
