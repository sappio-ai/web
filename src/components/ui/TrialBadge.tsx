'use client'

import { Clock } from 'lucide-react'

interface TrialBadgeProps {
  daysRemaining: number
  plan: string
}

export function TrialBadge({ daysRemaining, plan }: TrialBadgeProps) {
  const planDisplay = plan === 'student_pro' ? 'Student Pro' : 'Pro Plus'
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
      <Clock className="w-4 h-4 text-purple-400" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-purple-300">
          {planDisplay} Trial
        </span>
        <span className="text-xs text-purple-400/70">
          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
        </span>
      </div>
    </div>
  )
}
