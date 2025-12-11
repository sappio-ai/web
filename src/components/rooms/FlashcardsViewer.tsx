'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Orb from '@/components/orb/Orb'

interface Flashcard {
  id: string
  front: string
  back: string
  topic?: string
}

interface FlashcardsViewerProps {
  studyPackId: string
  roomId: string
  userId: string
  sharedToolId: string
  onComplete?: (result: any) => void
}

export default function FlashcardsViewer({
  studyPackId,
  roomId,
  userId,
  sharedToolId,
  onComplete,
}: FlashcardsViewerProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cardsReviewed, setCardsReviewed] = useState(0)

  useEffect(() => {
    fetchFlashcards()
  }, [studyPackId])

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/study-packs/${studyPackId}/flashcards`)

      if (!response.ok) {
        throw new Error('Failed to fetch flashcards')
      }

      const data = await response.json()
      setFlashcards(data.flashcards || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped && currentIndex === cardsReviewed) {
      setCardsReviewed(cardsReviewed + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleComplete = async () => {
    try {
      // Record completion
      await fetch(`/api/rooms/${roomId}/shared-tools/${sharedToolId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: {
            cardsReviewed,
            totalCards: flashcards.length,
          },
        }),
      })

      if (onComplete) {
        onComplete({
          cardsReviewed,
          totalCards: flashcards.length,
        })
      }
    } catch (err) {
      console.error('Failed to record completion:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="processing-thinking" size="lg" />
        <p className="text-[#64748B] mt-4">Loading flashcards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="error-confused" size="lg" />
        <p className="text-[#EF4444] mt-4">{error}</p>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="neutral" size="lg" />
        <p className="text-[#64748B] mt-4">No flashcards available</p>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      {/* Progress */}
      <div className="text-center mb-6">
        <p className="text-[#64748B] text-[16px]">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        {currentCard.topic && (
          <p className="text-[#5A5FF0] text-[14px] font-medium mt-1">
            {currentCard.topic}
          </p>
        )}
      </div>

      {/* Flashcard */}
      <div
        className="relative w-full max-w-2xl h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden">
            <div className="relative h-full">
              {/* Paper stack effect */}
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
              
              <div className="relative h-full bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] flex flex-col items-center justify-center">
                <div className="text-[13px] text-[#94A3B8] font-medium mb-4">QUESTION</div>
                <p className="text-[#1A1D2E] text-[20px] font-medium text-center leading-relaxed">
                  {currentCard.front}
                </p>
                <div className="absolute bottom-6 text-[#94A3B8] text-[13px]">
                  Click to reveal answer
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="relative h-full">
              {/* Paper stack effect */}
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
              
              <div className="relative h-full bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] flex flex-col items-center justify-center">
                <div className="text-[13px] text-[#5A5FF0] font-medium mb-4">ANSWER</div>
                <p className="text-[#1A1D2E] text-[18px] text-center leading-relaxed">
                  {currentCard.back}
                </p>
                <div className="absolute bottom-6 text-[#94A3B8] text-[13px]">
                  Click to flip back
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePrevious()
          }}
          disabled={currentIndex === 0}
          className="p-3 bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-[#64748B]" />
        </button>

        <div className="flex items-center gap-2">
          {flashcards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-[#5A5FF0]'
                  : index < currentIndex
                  ? 'bg-[#5A5FF0]/40'
                  : 'bg-[#E2E8F0]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          disabled={currentIndex === flashcards.length - 1}
          className="p-3 bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-[#64748B]" />
        </button>
      </div>

      {/* Complete Button */}
      {currentIndex === flashcards.length - 1 && (
        <button
          onClick={handleComplete}
          className="mt-6 px-8 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors shadow-sm"
        >
          Mark as Complete
        </button>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
