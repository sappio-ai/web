'use client'

import { Flame, CheckCircle } from 'lucide-react'

interface SessionXPBarProps {
  sessionXp: number
  dailyXp: number
  dailyGoal: number
  level: number
  dailyGoalJustMet?: boolean
}

export default function SessionXPBar({ sessionXp, dailyXp, dailyGoal, level, dailyGoalJustMet }: SessionXPBarProps) {
  const dailyProgress = Math.min((dailyXp / dailyGoal) * 100, 100)
  const goalComplete = dailyXp >= dailyGoal

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl border border-[#E2E8F0] px-4 py-2.5 flex items-center gap-4 shadow-sm">
      {/* Level + Session XP */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#5A5FF0] text-white text-xs font-bold">
          {level}
        </span>
        <span className="text-sm font-semibold text-[#1A1D2E] tabular-nums">
          +{sessionXp} <span className="text-[#5A5FF0]">XP</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#E2E8F0]" />

      {/* Daily Goal Progress */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {goalComplete ? (
          <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
        ) : (
          <Flame className="w-4 h-4 text-[#F59E0B] shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                goalComplete ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
              } ${dailyGoalJustMet ? 'animate-pulse' : ''}`}
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>
        <span className="text-[11px] text-[#64748B] tabular-nums shrink-0">
          {dailyXp}/{dailyGoal}
        </span>
      </div>
    </div>
  )
}
