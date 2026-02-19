'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck, Flame, ArrowRight } from 'lucide-react'
import Orb from '../orb/Orb'
import type { SessionStats } from '@/lib/types/flashcards'

const STORAGE_KEY = 'sappio_first_session_done'

interface FirstSessionCompleteProps {
  stats: SessionStats
  onContinue: () => void
  onRestart: () => void
}

export default function FirstSessionComplete({ stats, onContinue, onRestart }: FirstSessionCompleteProps) {
  const [isFirstSession, setIsFirstSession] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      setIsFirstSession(true)
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }, [])

  if (!isFirstSession) return null

  const accuracy = stats.cardsReviewed > 0
    ? Math.round(((stats.good + stats.easy) / stats.cardsReviewed) * 100)
    : 0

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto text-center animate-in fade-in duration-500">
      <Orb pose="success-celebrating" size="lg" />

      <h2 className="text-[28px] font-bold text-[#1A1D2E] mt-6 mb-2">
        First review complete!
      </h2>

      <p className="text-[16px] text-[#64748B] mb-6">
        You reviewed <span className="font-semibold text-[#1A1D2E]">{stats.cardsReviewed} cards</span>{' '}
        with <span className="font-semibold text-[#10B981]">{accuracy}% accuracy</span>. Great start!
      </p>

      <div className="w-full bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-[#5A5FF0]" />
          </div>
          <div className="text-left">
            <h3 className="text-[16px] font-bold text-[#1A1D2E]">See you tomorrow!</h3>
            <p className="text-[13px] text-[#64748B]">
              Your cards will be ready for review based on how you rated them
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#FEF3C7] rounded-lg">
          <Flame className="w-5 h-5 text-[#F59E0B]" />
          <p className="text-[14px] text-[#92400E]">
            Come back daily to build your streak and strengthen your memory
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-3.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-xl transition-colors shadow-lg shadow-[#5A5FF0]/20 flex items-center justify-center gap-2"
        >
          Back to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onRestart}
          className="flex-1 px-6 py-3.5 bg-white hover:bg-[#F8FAFB] text-[#1A1D2E] text-[15px] font-semibold rounded-xl transition-colors border border-[#E2E8F0]"
        >
          Review More Cards
        </button>
      </div>
    </div>
  )
}
