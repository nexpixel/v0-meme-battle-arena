"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MemeCard } from "@/components/ui/meme-card"
import { cn } from "@/lib/utils"
import { Search, Swords, AlertCircle } from "lucide-react"

interface Meme {
  id: string
  title: string
  image_url: string
  creator: {
    username: string
    display_name?: string
  }
}

export default function CreateBattlePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("24")
  const [searchQuery, setSearchQuery] = useState("")
  const [availableMemes, setAvailableMemes] = useState<Meme[]>([])
  const [selectedMemeA, setSelectedMemeA] = useState<Meme | null>(null)
  const [selectedMemeB, setSelectedMemeB] = useState<Meme | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchMemes()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      searchMemes()
    } else {
      fetchMemes()
    }
  }, [searchQuery])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setUser(user)
  }

  const fetchMemes = async () => {
    const { data: memes, error } = await supabase
      .from("memes")
      .select(`
        id,
        title,
        image_url,
        creator:profiles!memes_creator_id_fkey(username, display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching memes:", error)
      return
    }

    setAvailableMemes(memes || [])
  }

  const searchMemes = async () => {
    const { data: memes, error } = await supabase
      .from("memes")
      .select(`
        id,
        title,
        image_url,
        creator:profiles!memes_creator_id_fkey(username, display_name)
      `)
      .ilike("title", `%${searchQuery}%`)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error searching memes:", error)
      return
    }

    setAvailableMemes(memes || [])
  }

  const handleCreateBattle = async () => {
    if (!user || !selectedMemeA || !selectedMemeB) {
      setError("Please select two memes for the battle")
      return
    }

    if (!title.trim()) {
      setError("Please enter a battle title")
      return
    }

    if (selectedMemeA.id === selectedMemeB.id) {
      setError("Please select two different memes")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const endsAt = new Date()
      endsAt.setHours(endsAt.getHours() + Number.parseInt(duration))

      const { data: battle, error } = await supabase
        .from("battles")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          meme_a_id: selectedMemeA.id,
          meme_b_id: selectedMemeB.id,
          creator_id: user.id,
          ends_at: endsAt.toISOString(),
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      router.push("/battles")
    } catch (error: any) {
      console.error("Error creating battle:", error)
      setError(error.message || "Failed to create battle")
    } finally {
      setIsLoading(false)
    }
  }

  const selectMeme = (meme: Meme) => {
    if (!selectedMemeA) {
      setSelectedMemeA(meme)
    } else if (!selectedMemeB && meme.id !== selectedMemeA.id) {
      setSelectedMemeB(meme)
    } else if (selectedMemeA.id === meme.id) {
      setSelectedMemeA(null)
    } else if (selectedMemeB?.id === meme.id) {
      setSelectedMemeB(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create Epic Battle
          </h1>
          <p className="text-muted-foreground">Select two memes to battle it out in the arena</p>
        </div>

        {/* Battle Setup */}
        <Card className="neon-border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              Battle Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Battle Title *</Label>
                <Input
                  id="title"
                  placeholder="Epic Meme Showdown #1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:border-primary focus:outline-none"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="168">1 week</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this epic battle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input border-border focus:border-primary min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected Memes */}
        <Card className="neon-border-secondary">
          <CardHeader>
            <CardTitle>Selected Combatants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meme A */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Fighter A</Badge>
                  {selectedMemeA && <Badge variant="outline">Selected</Badge>}
                </div>

                {selectedMemeA ? (
                  <MemeCard
                    id={selectedMemeA.id}
                    title={selectedMemeA.title}
                    imageUrl={selectedMemeA.image_url}
                    creator={selectedMemeA.creator}
                    stats={{ votes: 0, reactions: 0, battles: 0 }}
                    showActions={false}
                    className="neon-border-secondary glow-secondary"
                  />
                ) : (
                  <div className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Select first meme</p>
                    </div>
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="hidden md:flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center glow-primary">
                  <span className="text-primary-foreground font-bold text-xl">VS</span>
                </div>
              </div>

              {/* Mobile VS */}
              <div className="md:hidden flex items-center justify-center py-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center glow-primary">
                  <span className="text-primary-foreground font-bold">VS</span>
                </div>
              </div>

              {/* Meme B */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Fighter B</Badge>
                  {selectedMemeB && <Badge variant="outline">Selected</Badge>}
                </div>

                {selectedMemeB ? (
                  <MemeCard
                    id={selectedMemeB.id}
                    title={selectedMemeB.title}
                    imageUrl={selectedMemeB.image_url}
                    creator={selectedMemeB.creator}
                    stats={{ votes: 0, reactions: 0, battles: 0 }}
                    showActions={false}
                    className="neon-border-accent glow-accent"
                  />
                ) : (
                  <div className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Select second meme</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meme Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Fighters</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search memes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-primary"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableMemes.map((meme) => {
                const isSelected = selectedMemeA?.id === meme.id || selectedMemeB?.id === meme.id

                return (
                  <div
                    key={meme.id}
                    className={cn("cursor-pointer transition-all duration-300", isSelected && "ring-2 ring-primary")}
                    onClick={() => selectMeme(meme)}
                  >
                    <MemeCard
                      id={meme.id}
                      title={meme.title}
                      imageUrl={meme.image_url}
                      creator={meme.creator}
                      stats={{ votes: 0, reactions: 0, battles: 0 }}
                      showActions={false}
                      className={cn("hover:glow-primary", isSelected && "neon-border-primary glow-primary")}
                    />
                    {isSelected && (
                      <Badge className="w-full justify-center mt-2 bg-primary text-primary-foreground">Selected</Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {availableMemes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No memes found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Create some memes first to start battles"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCreateBattle}
            disabled={isLoading || !selectedMemeA || !selectedMemeB || !title.trim()}
            size="lg"
            className="glow-primary hover:glow-primary px-8"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Creating Battle...
              </>
            ) : (
              <>
                <Swords className="h-4 w-4 mr-2" />
                Create Epic Battle
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
