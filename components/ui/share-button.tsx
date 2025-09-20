"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ShareButtonProps {
  title: string
  url: string
  text?: string
  className?: string
}

export function ShareButton({ title, url, text, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}${url}`
  const shareText = text || `Check out this epic meme battle: ${title}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleFarcasterShare = () => {
    const farcasterUrl = `https://warpcast.xyz/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`
    window.open(farcasterUrl, "_blank", "width=600,height=400")
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, "_blank", "width=600,height=400")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white ${className}`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-700">
        <DropdownMenuItem
          onClick={handleFarcasterShare}
          className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
        >
          <span className="mr-2">🟣</span>
          Share on Farcaster
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleTwitterShare}
          className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
        >
          <span className="mr-2">🐦</span>
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
