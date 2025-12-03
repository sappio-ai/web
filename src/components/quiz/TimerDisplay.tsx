'use client'

import Orb from '../orb/Orb'

interface TimerDisplayProps {
  timeRemaining: number
}

export default function TimerDisplay({ timeRemaining }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isLowTime = timeRemaining < 120 // Less than 2 minutes

  return (
    <div className="flex items-center gap-3">
      {/* Timer Orb */}
      <div className="hidden sm:block">
        <Orb pose="processing-thinking" size="sm" />
      </div>

      {/* Timer Display */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
          isLowTime
            ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
            : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-mono font-bold text-[16px]">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      {/* Low Time Warning */}
      {isLowTime && (
        <span className="text-[#EF4444] text-[14px] font-semibold animate-pulse">
          Hurry!
        </span>
      )}
    </div>
  )
}
