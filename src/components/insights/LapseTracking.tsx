'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Calendar, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Orb from '@/components/orb/Orb'
import { AnalyticsService } from '@/lib/services/AnalyticsService'

interface LapseTrackingProps {
  packId: string
}

interface FlashcardWithLapses {
  id: string
  front: string
  topic: string | null
  lapses: number
  due_at: string | null
}

export default function LapseTracking({ packId }: LapseTrackingProps) {
  const [lapseData, setLapseData] = useState<{
    cards: FlashcardWithLapses[]
    totalLapses: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchLapseData()
  }, [packId])

  const fetchLapseData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/study-packs/${packId}/insights`)
      if (response.ok) {
        const data = await response.json()
        setLapseData(data.lapseData)
      }
    } catch (error) {
      console.error('Error fetching lapse data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (cardId: string) => {
    // Track the click
    AnalyticsService.trackLapseCardClicked(cardId, packId)
    // Navigate to flashcards tab with this card pre-selected
    router.push(`/study-packs/${packId}?tab=flashcards&cardId=${cardId}`)
  }

  if (isLoading) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/5 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!lapseData || lapseData.cards.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Orb pose="success-celebrating" size="lg" />
            <h3 className="text-xl font-bold text-white mt-6 mb-2">
              No Struggling Cards!
            </h3>
            <p className="text-gray-400 text-center text-sm max-w-md">
              Great job! You don&apos;t have any cards with 3+ lapses. Keep up the
              excellent work! 🎉
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">
            Cards Needing Attention
          </h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          These cards have been forgotten multiple times. Focus your review
          efforts here.
        </p>

        {/* Cards List */}
        <div className="space-y-3">
          {lapseData.cards.map((card, index) => {
            const lastReviewed = card.due_at
              ? new Date(card.due_at)
              : null

            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(card.id)}
                className="w-full text-left p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 hover:border-orange-500/50 transition-all group/card"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Card Front */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium line-clamp-2 mb-2">
                      {card.front}
                    </p>
                    {card.topic && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">
                          {card.topic}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lapse Count Badge */}
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
                      <p className="text-xs font-bold text-red-400">
                        {card.lapses} {card.lapses === 1 ? 'lapse' : 'lapses'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Reviewed */}
                {lastReviewed && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Last reviewed:{' '}
                      {lastReviewed.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {/* Hover indicator */}
                <div className="mt-3 pt-3 border-t border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <p className="text-xs text-[#a8d5d5] font-medium">
                    Click to review this card →
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">
                {lapseData.cards.length}
              </span>{' '}
              {lapseData.cards.length === 1 ? 'card' : 'cards'} with high lapse
              count
            </p>
            <p className="text-sm text-gray-400">
              <span className="text-orange-400 font-medium">
                {lapseData.totalLapses}
              </span>{' '}
              total lapses
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Tip: Try breaking down difficult cards into smaller, simpler
            concepts
          </p>
        </div>
      </div>
    </div>
  )
}
