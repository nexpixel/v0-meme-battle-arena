"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ImageIcon, Zap, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function CreateMemePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

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

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setImagePreview(url)
  }

  const handleCreateMeme = async () => {
    if (!user) {
      setError("Please log in to create memes")
      return
    }

    if (!title.trim()) {
      setError("Please enter a meme title")
      return
    }

    if (!imageUrl.trim()) {
      setError("Please provide an image URL")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/memes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          description: description.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/")
      } else {
        setError(data.error || "Failed to create meme")
      }
    } catch (error: any) {
      console.error("Error creating meme:", error)
      setError("Failed to create meme")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create Epic Meme
          </h1>
          <p className="text-muted-foreground">Upload your meme and join the battle arena</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="neon-border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Meme Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Meme Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your epic meme title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground text-right">{title.length}/100</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/your-meme.jpg"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                />
                <div className="text-xs text-muted-foreground">Paste a direct link to your meme image</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add some context or humor to your meme..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-input border-border focus:border-primary min-h-[100px]"
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground text-right">{description.length}/500</div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              {/* Create Button */}
              <Button
                onClick={handleCreateMeme}
                disabled={isLoading || !title.trim() || !imageUrl.trim()}
                size="lg"
                className="w-full glow-primary hover:glow-primary"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Meme...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create Epic Meme
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="neon-border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-secondary" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Meme preview"
                      fill
                      className="object-cover"
                      onError={() => {
                        setImagePreview("")
                        setError("Invalid image URL")
                      }}
                    />
                  </div>

                  {title && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-balance">{title}</h3>
                      {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">No image yet</h3>
                      <p className="text-sm text-muted-foreground">Enter an image URL to see preview</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Pro Tips for Epic Memes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>• Use high-quality images for better engagement</div>
              <div>• Keep titles catchy and memorable</div>
              <div>• Add context in the description if needed</div>
              <div>• Make sure your image URL is publicly accessible</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
