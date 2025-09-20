import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Swords, Trophy, Zap, Users, TrendingUp, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold cyber-text text-primary">MEME_BATTLE_ARENA.EXE</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            &gt; ENTER THE DIGITAL ARENA WHERE MEMES CLASH IN EPIC BATTLES
            <br />
            &gt; VOTE, REACT, AND CLIMB THE LEADERBOARD
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="glow-primary hover:glow-primary text-lg px-8 neon-border-primary">
            <Link href="/battles">
              <Swords className="mr-2 h-5 w-5" />
              [ENTER_ARENA]
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:glow-secondary text-lg px-8 bg-transparent neon-border-secondary"
          >
            <Link href="/create">
              <Zap className="mr-2 h-5 w-5" />
              [CREATE_MEME]
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center hover:glow-primary transition-all duration-300 neon-border-primary">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mx-auto mb-2">
              <Swords className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary cyber-text">LOADING...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">&gt; ACTIVE_BATTLES</p>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-secondary transition-all duration-300 neon-border-secondary">
          <CardHeader>
            <div className="w-12 h-12 bg-secondary/20 rounded-sm flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-2xl font-bold text-secondary cyber-text">LOADING...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">&gt; ARENA_WARRIORS</p>
          </CardContent>
        </Card>

        <Card className="text-center hover:glow-accent transition-all duration-300 neon-border-accent">
          <CardHeader>
            <div className="w-12 h-12 bg-accent/20 rounded-sm flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold text-accent cyber-text">LOADING...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">&gt; TOTAL_VOTES</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hot Battles */}
        <Card className="hover:glow-primary transition-all duration-300 neon-border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 cyber-text">
              <Swords className="h-5 w-5 text-primary" />
              [HOT_BATTLES]
              <Badge variant="secondary" className="ml-auto neon-border-secondary">
                LIVE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center p-8 bg-muted/30 rounded-sm border border-border">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">&gt; NO_ACTIVE_BATTLES</p>
                  <p className="text-sm text-muted-foreground mt-1">&gt; CREATE_FIRST_BATTLE</p>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full bg-transparent neon-border-primary">
              <Link href="/battles">[VIEW_ALL_BATTLES]</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Top Warriors */}
        <Card className="hover:glow-secondary transition-all duration-300 neon-border-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 cyber-text">
              <Trophy className="h-5 w-5 text-secondary" />
              [TOP_WARRIORS]
              <Badge variant="outline" className="ml-auto">
                WEEKLY
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center p-8 bg-muted/30 rounded-sm border border-border">
                <div className="text-center">
                  <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">&gt; NO_WARRIORS_YET</p>
                  <p className="text-sm text-muted-foreground mt-1">&gt; JOIN_THE_BATTLE</p>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full bg-transparent neon-border-secondary">
              <Link href="/leaderboard">[VIEW_LEADERBOARD]</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center py-12 cyber-gradient neon-border-accent">
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-accent cyber-text">[READY_TO_ENTER_ARENA?]</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              &gt; JOIN_WARRIORS_BATTLING_FOR_MEME_SUPREMACY
              <br />
              &gt; IN_THE_CYBERPUNK_ARENA
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="glow-primary hover:glow-primary neon-border-primary">
              <Link href="/auth/login">[JOIN_BATTLE]</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="hover:glow-secondary bg-transparent neon-border-secondary"
            >
              <Link href="/battles">[WATCH_BATTLES]</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
