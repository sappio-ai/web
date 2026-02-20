'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Flame,
  PenTool,
  Trophy,
  Zap,
  Target,
  Sparkles,
  Calendar,
  Check,
  Clock,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  BookOpen,
  Flame,
  PenTool,
  Trophy,
  Zap,
  Target,
  Sparkles,
  Calendar,
}

interface Challenge {
  id: string
  challenge_type: string
  current_value: number
  target_value: number
  xp_reward: number
  completed_at: string | null
  name?: string
  description?: string
  icon?: string
  xpReward?: number
}

export default function WeeklyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [daysUntilReset, setDaysUntilReset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data.challenges || [])
        setDaysUntilReset(data.daysUntilReset || 0)
      })
      .catch(err => console.error('Failed to fetch challenges:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-40 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-5 w-28 bg-[#E2E8F0] rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#E2E8F0] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[#E2E8F0] rounded animate-pulse" />
                <div className="h-2 w-full bg-[#E2E8F0] rounded-full animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-[#E2E8F0] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!challenges.length) return null

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-bold text-[#1A1D2E]">Weekly Challenges</h3>
        <div className="flex items-center gap-1.5 text-[13px] text-[#64748B]">
          <Clock className="w-3.5 h-3.5" />
          <span>Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-4">
        {challenges.map(challenge => {
          const IconComponent = ICON_MAP[challenge.icon || 'Target'] || Target
          const isCompleted = !!challenge.completed_at
          const progress = challenge.target_value > 0
            ? Math.min((challenge.current_value / challenge.target_value) * 100, 100)
            : 0

          return (
            <div
              key={challenge.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                isCompleted ? 'bg-[#10B981]/5' : 'bg-[#F8FAFB]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-[#10B981]/10'
                    : 'bg-[#5A5FF0]/10'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-[#10B981]" strokeWidth={2.5} />
                ) : (
                  <IconComponent
                    className="w-5 h-5 text-[#5A5FF0]"
                    strokeWidth={2}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p
                    className={`text-[14px] font-semibold ${
                      isCompleted ? 'text-[#10B981]' : 'text-[#1A1D2E]'
                    }`}
                  >
                    {challenge.name || challenge.challenge_type}
                  </p>
                  <span className="text-[12px] text-[#64748B]">
                    {challenge.current_value}/{challenge.target_value}
                  </span>
                </div>
                <p className="text-[12px] text-[#64748B] mb-1.5">
                  {challenge.description || ''}
                </p>
                <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-[#10B981]' : 'bg-[#5A5FF0]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  isCompleted
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'bg-[#5A5FF0]/10 text-[#5A5FF0]'
                }`}
              >
                +{challenge.xpReward || challenge.xp_reward} XP
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
