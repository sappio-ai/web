'use client'

import Orb from '../orb/Orb'

interface BreakTimerProps {
  timeRemaining: number
}

export default function BreakTimer({ timeRemaining }: BreakTimerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      {/* Neutral Orb */}
      <div className="mb-6">
        <Orb pose="neutral" size="lg" />
      </div>

      {/* Timer Display */}
      <h3 className="text-3xl font-bold text-white mb-2">Break Time</h3>
      <div className="text-6xl font-bold text-[#a8d5d5] mb-4">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      {/* Message */}
      <p className="text-gray-300 text-center max-w-md">
        Relax and recharge! Stretch, grab some water, or just rest your eyes.
        We&apos;ll notify you when it&apos;s time to resume.
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] transition-all duration-1000"
          style={{ width: `${((300 - timeRemaining) / 300) * 100}%` }}
        />
      </div>
    </div>
  )
}
