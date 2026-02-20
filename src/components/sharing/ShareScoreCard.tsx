'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Download } from 'lucide-react'
import { generateScoreCardImage, type ScoreCardData } from '@/lib/utils/scoreCard'

interface ShareScoreCardProps {
  isOpen: boolean
  onClose: () => void
  data: ScoreCardData
}

export default function ShareScoreCard({ isOpen, onClose, data }: ShareScoreCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setImageUrl(null)
      return
    }
    generateScoreCardImage(data).then(setImageUrl)
  }, [isOpen, data])

  const shareText = data.type === 'quiz'
    ? `I scored ${data.score ?? '—'} on my Sappio quiz!`
    : `I just reviewed ${data.cardsReviewed ?? 0} cards with ${data.accuracy ?? 0}% accuracy on Sappio!`

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://sappio.ai')}`,
      '_blank'
    )
  }

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} https://sappio.ai`)}`,
      '_blank'
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText('https://sappio.ai')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'sappio-score.png'
    a.click()
  }

  const handleNativeShare = useCallback(async () => {
    if (!imageUrl || !navigator.share) return
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob], 'sappio-score.png', { type: 'image/png' })
      await navigator.share({ text: shareText, url: 'https://sappio.ai', files: [file] })
    } catch {
      // user cancelled
    }
  }, [imageUrl, shareText])

  if (!isOpen) return null

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#94A3B8] hover:text-[#1A1D2E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-[20px] font-bold text-[#1A1D2E] mb-4">Share Your Score</h3>

        {/* Image preview */}
        <div className="mb-5 rounded-xl overflow-hidden border border-[#E2E8F0]">
          {imageUrl ? (
            <img src={imageUrl} alt="Score card" className="w-full" />
          ) : (
            <div className="w-full aspect-[3/2] bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] text-sm">
              Generating...
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={handleTwitter}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors text-[#1A1D2E]"
          >
            <span className="text-lg">𝕏</span>
            <span className="text-[12px] font-medium">Twitter</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors text-[#1A1D2E]"
          >
            <span className="text-lg">💬</span>
            <span className="text-[12px] font-medium">WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors text-[#1A1D2E]"
          >
            <span className="text-lg">🔗</span>
            <span className="text-[12px] font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors text-[#1A1D2E]"
          >
            <Download className="w-[18px] h-[18px]" />
            <span className="text-[12px] font-medium">Download</span>
          </button>
        </div>

        {/* Native share button */}
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-4 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold rounded-xl transition-colors"
          >
            Share...
          </button>
        )}
      </div>
    </div>
  )
}
