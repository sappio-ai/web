'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import type { Flashcard } from '@/lib/types/flashcards'

interface DueQueueProps {
  packId: string
  topicFilter?: string
}

export default function DueQueue({ packId, topicFilter }: DueQueueProps) {
  const [dueCards, setDueCards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        setIsLoading(true)
        const url = new URL(
          `/api/study-packs/${packId}/flashcards/due`,
          window.location.origin
        )
        if (topicFilter) {
          url.searchParams.set('topic', topicFilter)
        }

        const response = await fetch(url.toString())
        if (response.ok) {
          const data = await response.json()
          setDueCards(data.cards || [])
        }
      } catch (error) {
        console.error('Error fetching due cards:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDueCards()
  }, [packId, topicFilter])

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-[#64748B]">Loading cards...</p>
      </div>
    )
  }

  if (dueCards.length === 0) {
    return null
  }

  // Show only first 5 cards as preview
  const previewCards = dueCards.slice(0, 5)

  return (
    <div className="space-y-3">
      <h3 className="text-[18px] font-semibold text-[#1A1D2E] mb-3">
        Next Cards to Review
      </h3>
      <div className="space-y-2">
        {previewCards.map((card, index) => (
          <div
            key={card.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFB] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5A5FF0]/10 flex items-center justify-center">
              <span className="text-[13px] font-bold text-[#5A5FF0]">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#1A1D2E] truncate text-[14px]">{card.front}</p>
              {card.topic && (
                <p className="text-[12px] text-[#64748B] mt-1">{card.topic}</p>
              )}
            </div>
            {card.due_at && (
              <div className="flex items-center gap-1 text-[12px] text-[#64748B]">
                <Clock className="w-3 h-3" />
                <span>Due</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {dueCards.length > 5 && (
        <p className="text-[13px] text-[#64748B] text-center mt-3">
          +{dueCards.length - 5} more card{dueCards.length - 5 !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
