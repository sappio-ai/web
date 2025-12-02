'use client'

import { CheckCircle, XCircle, Clock } from 'lucide-react'
import Orb from '../orb/Orb'
import type { SessionStats as SessionStatsType } from '@/lib/types/flashcards'

interface SessionStatsProps {
  stats: SessionStatsType
  onRestart: () => void
  onExit?: () => void
  topicFilter?: string
}

export default function SessionStats({
  stats,
  onRestart,
  onExit,
  topicFilter,
}: SessionStatsProps) {
  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes === 0) {
      return `${seconds}s`
    }
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  // Determine if session was good (most cards graded Good or Easy)
  const goodCards = stats.good + stats.easy
  const isGoodSession = stats.cardsReviewed > 0 && goodCards / stats.cardsReviewed >= 0.6

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      {/* Orb Avatar */}
      <div className="mb-6">
        <Orb
          pose={isGoodSession ? 'success-celebrating' : 'neutral'}
          size="lg"
        />
      </div>

      {/* Title */}
      <h2 className="text-[32px] font-bold text-[#1A1D2E] mb-2">
        Session Complete!
        {topicFilter && (
          <span className="block text-[20px] text-[#5A5FF0] mt-2">
            {topicFilter}
          </span>
        )}
      </h2>
      <p className="text-[#64748B] mb-8 text-[16px]">
        {isGoodSession
          ? 'Great job! Keep up the excellent work!'
          : "Good effort! You're making progress!"}
      </p>

      {/* Stats Card - Paper Style */}
      <div className="w-full relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Cards Reviewed */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#5A5FF0]" strokeWidth={2} />
              </div>
              <p className="text-[32px] font-bold text-[#1A1D2E]">
                {stats.cardsReviewed}
              </p>
              <p className="text-[13px] text-[#64748B]">Cards Reviewed</p>
            </div>

            {/* Average Time */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#5A5FF0]" strokeWidth={2} />
              </div>
              <p className="text-[32px] font-bold text-[#1A1D2E]">
                {(stats.averageTime / 1000).toFixed(1)}s
              </p>
              <p className="text-[13px] text-[#64748B]">Avg Time</p>
            </div>

            {/* Total Time */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#5A5FF0]" strokeWidth={2} />
              </div>
              <p className="text-[32px] font-bold text-[#1A1D2E]">
                {formatTime(stats.totalTime)}
              </p>
              <p className="text-[13px] text-[#64748B]">Total Time</p>
            </div>
          </div>

          {/* Grade Breakdown */}
          <div className="border-t border-[#E2E8F0] pt-6">
            <h3 className="text-[18px] font-semibold text-[#1A1D2E] mb-4">
              Grade Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/20">
                <XCircle className="w-5 h-5 text-[#EF4444]" strokeWidth={2} />
                <div>
                  <p className="text-[24px] font-bold text-[#1A1D2E]">{stats.again}</p>
                  <p className="text-[12px] text-[#64748B]">Again</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/20">
                <XCircle className="w-5 h-5 text-[#F59E0B]" strokeWidth={2} />
                <div>
                  <p className="text-[24px] font-bold text-[#1A1D2E]">{stats.hard}</p>
                  <p className="text-[12px] text-[#64748B]">Hard</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#DCFCE7] border border-[#10B981]/20">
                <CheckCircle className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                <div>
                  <p className="text-[24px] font-bold text-[#1A1D2E]">{stats.good}</p>
                  <p className="text-[12px] text-[#64748B]">Good</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#EEF2FF] border border-[#5A5FF0]/20">
                <CheckCircle className="w-5 h-5 text-[#5A5FF0]" strokeWidth={2} />
                <div>
                  <p className="text-[24px] font-bold text-[#1A1D2E]">{stats.easy}</p>
                  <p className="text-[12px] text-[#64748B]">Easy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        {onExit && (
          <button
            onClick={onExit}
            className="px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[16px] font-semibold rounded-lg transition-colors shadow-sm"
          >
            Back to Overview
          </button>
        )}
      </div>
    </div>
  )
}
