'use client'

import { motion } from 'framer-motion'
import type { Flashcard } from '@/lib/types/flashcards'

interface FlashcardCardProps {
  card: Flashcard
  isFlipped: boolean
  onFlip: () => void
}

export default function FlashcardCard({
  card,
  isFlipped,
  onFlip,
}: FlashcardCardProps) {
  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <motion.div
      className="relative w-full max-w-2xl h-64 sm:h-80 md:h-96 cursor-pointer perspective-1000"
      onClick={onFlip}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.6, type: 'spring', stiffness: 100 }
      }
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Front Side - Paper Card */}
      <div
        className="absolute inset-0 bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 md:p-8 flex items-center justify-center shadow-[0_4px_16px_rgba(15,23,42,0.12),0_2px_4px_rgba(15,23,42,0.08)]"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <p className="text-lg sm:text-xl md:text-2xl text-[#1A1D2E] text-center break-words">
          {card.front}
        </p>
      </div>

      {/* Back Side - Paper Card with Purple Accent */}
      <div
        className="absolute inset-0 bg-white rounded-2xl border border-[#5A5FF0]/30 p-4 sm:p-6 md:p-8 flex items-center justify-center shadow-[0_4px_16px_rgba(90,95,240,0.12),0_2px_4px_rgba(90,95,240,0.08)]"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        <p className="text-lg sm:text-xl md:text-2xl text-[#1A1D2E] text-center break-words">
          {card.back}
        </p>
      </div>
    </motion.div>
  )
}
