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
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-[#F1F5F9] rounded-lg animate-pulse"
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
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center py-12">
            <Orb pose="success-celebrating" size="lg" />
            <h3 className="text-[20px] font-bold text-[#1A1D2E] mt-6 mb-2">
              No Struggling Cards!
            </h3>
            <p className="text-[#64748B] text-center text-[14px] max-w-md">
              Great job! You don&apos;t have any cards with 3+ lapses. Keep up the
              excellent work! 🎉
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
          <h3 className="text-[20px] font-bold text-[#1A1D2E]">
            Cards Needing Attention
          </h3>
        </div>
        <p className="text-[#64748B] text-[14px] mb-6">
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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCardClick(card.id)}
                className="w-full text-left p-4 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] hover:border-[#F87171] hover:bg-[#FEE2E2] transition-all group/card"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Card Front */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1D2E] font-semibold line-clamp-2 mb-2 text-[14px]">
                      {card.front}
                    </p>
                    {card.topic && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-[#94A3B8]" />
                        <span className="text-[12px] text-[#64748B]">
                          {card.topic}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lapse Count Badge */}
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1.5 rounded-lg bg-[#FED7AA] border border-[#FB923C]">
                      <p className="text-[11px] font-bold text-[#C2410C]">
                        {card.lapses} {card.lapses === 1 ? 'lapse' : 'lapses'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Reviewed */}
                {lastReviewed && (
                  <div className="flex items-center gap-2 text-[12px] text-[#94A3B8]">
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
                <div className="mt-3 pt-3 border-t border-[#FCA5A5]/30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <p className="text-[12px] text-[#5A5FF0] font-semibold">
                    Click to review this card →
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-[#64748B]">
              <span className="text-[#1A1D2E] font-semibold">
                {lapseData.cards.length}
              </span>{' '}
              {lapseData.cards.length === 1 ? 'card' : 'cards'} with high lapse
              count
            </p>
            <p className="text-[14px] text-[#64748B]">
              <span className="text-[#F59E0B] font-semibold">
                {lapseData.totalLapses}
              </span>{' '}
              total lapses
            </p>
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-2 text-center">
            💡 Tip: Try breaking down difficult cards into smaller, simpler
            concepts
          </p>
        </div>
      </div>
    </div>
  )
}
