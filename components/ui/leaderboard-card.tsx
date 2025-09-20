"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Trophy, Flame, Target, Zap } from "lucide-react"

interface LeaderboardCardProps {
  rank: number
  user: {
    id: string
    username: string
    displayName?: string
    avatarUrl?: string
  }
  stats: {
    score: number
    totalVotesReceived: number
    totalBattlesWon: number
    totalMemesCreated: number
    totalReactionsReceived: number
  }
  className?: string
}

export function LeaderboardCard({ rank, user, stats, className }: LeaderboardCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500 glow-accent"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-amber-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={cn("h-6 w-6", getRankColor(rank))} />
    }
    return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:glow-primary",
        "border-border hover:border-primary/50",
        rank === 1 && "neon-border-accent",
        rank === 2 && "neon-border-secondary",
        rank === 3 && "neon-border-primary",
        className,
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            {getRankIcon(rank)}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate cyber-text text-sm sm:text-base">
                {user.displayName || user.username}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username}</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-right">
            <div className="text-lg sm:text-2xl font-bold text-primary cyber-text">{stats.score.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">POINTS</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <div className="flex items-center gap-1 sm:gap-2">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium truncate">{stats.totalVotesReceived}</div>
              <div className="text-xs text-muted-foreground">Votes</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium truncate">{stats.totalBattlesWon}</div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium truncate">{stats.totalMemesCreated}</div>
              <div className="text-xs text-muted-foreground">Memes</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium truncate">{stats.totalReactionsReceived}</div>
              <div className="text-xs text-muted-foreground">Reactions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
