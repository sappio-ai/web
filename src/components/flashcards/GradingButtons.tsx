'use client'

import { useEffect, useRef } from 'react'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import type { Grade } from '@/lib/types/flashcards'

interface GradingButtonsProps {
  onGrade: (grade: Grade) => void
  disabled?: boolean
}

export default function GradingButtons({ onGrade, disabled = false }: GradingButtonsProps) {
  const goodButtonRef = useRef<HTMLButtonElement>(null)

  useKeyboardShortcuts({
    '1': () => !disabled && onGrade('again'),
    '2': () => !disabled && onGrade('hard'),
    '3': () => !disabled && onGrade('good'),
    '4': () => !disabled && onGrade('easy'),
  })

  // Auto-focus the "Good" button when component mounts
  useEffect(() => {
    goodButtonRef.current?.focus()
  }, [])

  return (
    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 sm:gap-3 mt-6 w-full md:w-auto md:justify-center">
      {/* Again Button */}
      <button
        onClick={() => onGrade('again')}
        disabled={disabled}
        className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#FEF2F2] active:bg-[#FEE2E2] border-2 border-[#EF4444] text-[#EF4444] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/40 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Grade as Again, review in less than 1 day"
      >
        <span className="text-base sm:text-lg font-bold">Again (1)</span>
        <span className="text-xs opacity-75">&lt; 1 day</span>
      </button>

      {/* Hard Button */}
      <button
        onClick={() => onGrade('hard')}
        disabled={disabled}
        className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#FEF3C7] active:bg-[#FDE68A] border-2 border-[#F59E0B] text-[#F59E0B] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Grade as Hard, review in 1 to 3 days"
      >
        <span className="text-base sm:text-lg font-bold">Hard (2)</span>
        <span className="text-xs opacity-75">1-3 days</span>
      </button>

      {/* Good Button */}
      <button
        ref={goodButtonRef}
        onClick={() => onGrade('good')}
        disabled={disabled}
        className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#DCFCE7] active:bg-[#BBF7D0] border-2 border-[#10B981] text-[#10B981] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Grade as Good, review in 4 to 7 days"
      >
        <span className="text-base sm:text-lg font-bold">Good (3)</span>
        <span className="text-xs opacity-75">4-7 days</span>
      </button>

      {/* Easy Button */}
      <button
        onClick={() => onGrade('easy')}
        disabled={disabled}
        className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#EEF2FF] active:bg-[#E0E7FF] border-2 border-[#5A5FF0] text-[#5A5FF0] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Grade as Easy, review in 7 or more days"
      >
        <span className="text-base sm:text-lg font-bold">Easy (4)</span>
        <span className="text-xs opacity-75">7+ days</span>
      </button>
    </div>
  )
}
