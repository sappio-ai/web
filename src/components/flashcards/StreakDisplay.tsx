'use client'

import { useState, useEffect } from 'react'
import { Trophy, Zap, Flame, Snowflake } from 'lucide-react'
import type { StreakData } from '@/lib/types/flashcards'

interface StreakDisplayProps {
  variant?: 'compact' | 'full'
  className?: string
}

export default function StreakDisplay({ 
  variant = 'full',
  className = '' 
}: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMilestone, setShowMilestone] = useState(false)

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/flashcards/stats')
        if (response.ok) {
          const data = await response.json()
          setStreak(data.streak)

          // Check for milestone
          const currentStreak = data.streak?.currentStreak || 0
          if ([7, 30, 100].includes(currentStreak)) {
            setShowMilestone(true)
          }
        }
      } catch (error) {
        console.error('Error fetching streak:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreak()
  }, [])

  if (isLoading || !streak || streak.currentStreak === 0) {
    return null
  }

  // Compact version for inline display
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEF3C7] rounded-lg border border-[#FCD34D] ${className}`}>
        <Flame className="w-4 h-4 text-[#F59E0B]" />
        <span className="text-[14px] font-semibold text-[#92400E]">
          {streak.currentStreak} day streak
        </span>
        {(streak.freezes || 0) > 0 && (
          <span className="flex items-center gap-1 text-[12px] font-medium text-[#3B82F6]">
            <Snowflake className="w-3 h-3" />
            {streak.freezes}
          </span>
        )}
      </div>
    )
  }

  // Full version for dashboard/tabs
  return (
    <>
      <div className={`relative ${className}`}>
        {/* Paper stack backing */}
        <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />
        
        {/* Main card - paper style */}
        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#FCD34D]/40">
          {/* Bookmark Tab - Gold for streak */}
          <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#F59E0B] rounded-b-[5px] shadow-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#D97706] rounded-t-sm" />
          </div>
          
          <div className="flex items-center justify-between gap-8">
            {/* Left: Orb and Streak */}
            <div className="flex items-center gap-5">
              {/* Orb */}
              <img 
                src="/orb/streak-orb.png" 
                alt="Fire Orb" 
                className="w-24 h-24 object-contain"
              />
              
              <div>
                <p className="text-[11px] text-[#64748B] uppercase tracking-[0.15em] font-semibold mb-1.5">STREAK</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-[56px] font-bold text-[#1A1D2E] leading-none">
                    {streak.currentStreak}
                  </span>
                  <span className="text-[20px] text-[#64748B] font-semibold uppercase">
                    {streak.currentStreak === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <p className="text-[14px] text-[#F59E0B] font-medium mt-2 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Keep the fire burning!
                </p>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex gap-4">
              {/* Personal Best */}
              <div className="text-center bg-white rounded-lg px-6 py-4 border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-[32px] font-bold text-[#1A1D2E]">
                    {streak.longestStreak}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Personal Best</p>
              </div>

              {/* Total Reviews */}
              <div className="text-center bg-white rounded-lg px-6 py-4 border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-[#5A5FF0]" />
                  <span className="text-[32px] font-bold text-[#1A1D2E]">
                    {streak.totalReviews}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Total Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Modal */}
      {showMilestone && (
        <div className="fixed inset-0 bg-[#1A1D2E]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            {/* Paper stack backing */}
            <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />
            
            {/* Main modal card */}
            <div className="relative bg-white rounded-xl p-10 shadow-[0_4px_24px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)] border border-[#FCD34D]/40">
              {/* Bookmark Tab - Gold */}
              <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#F59E0B] rounded-b-[5px] shadow-sm">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#D97706] rounded-t-sm" />
              </div>
              
              <div className="text-center">
                {/* Fire Orb */}
                <div className="w-28 h-28 mx-auto mb-6">
                  <img 
                    src="/orb/streak-orb.png" 
                    alt="Fire Orb" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <h2 className="text-[32px] font-bold text-[#1A1D2E] mb-4">
                  Milestone Unlocked! 🎉
                </h2>
                <div className="inline-block px-8 py-4 bg-[#FEF3C7] rounded-xl mb-6 border border-[#FCD34D]">
                  <p className="text-[36px] font-bold text-[#F59E0B]">
                    {streak.currentStreak} Day Streak
                  </p>
                </div>
                <p className="text-[16px] text-[#64748B] mb-8 leading-relaxed">
                  You&apos;re absolutely crushing it! Your dedication is paying off. Keep this momentum going! 💪
                </p>
                <button
                  onClick={() => setShowMilestone(false)}
                  className="w-full px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold text-[16px] rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
                >
                  Let&apos;s Keep Going!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
