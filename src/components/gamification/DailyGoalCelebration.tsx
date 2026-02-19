'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface DailyGoalCelebrationProps {
  onDone: () => void
}

export default function DailyGoalCelebration({ onDone }: DailyGoalCelebrationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300) // wait for fade-out
    }, 2500)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-[#10B981] text-white rounded-xl px-6 py-3 shadow-lg shadow-[#10B981]/25 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm">Daily Goal Complete!</p>
          <p className="text-xs text-white/80">Keep going for bonus XP</p>
        </div>
      </div>
    </div>
  )
}
