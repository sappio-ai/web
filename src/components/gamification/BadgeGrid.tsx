'use client'

import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import BadgeIcon from './BadgeIcon'
import type { BadgeDefinition } from '@/lib/constants/badges'

interface EarnedBadge {
  badge_id: string
  earned_at: string
}

export default function BadgeGrid() {
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const [earned, setEarned] = useState<EarnedBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch('/api/user/badges')
        if (!res.ok) return
        const data = await res.json()
        if (data.success) {
          setBadges(data.badges)
          setEarned(data.earned)
        }
      } catch (err) {
        console.error('Failed to fetch badges:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBadges()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-[#F8FAFB] rounded-xl border border-[#E2E8F0] p-3 animate-pulse">
            <div className="w-11 h-11 bg-gray-200 rounded-xl mx-auto mb-2" />
            <div className="h-3 bg-gray-200 rounded w-14 mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  const earnedMap = new Map(earned.map((e) => [e.badge_id, e.earned_at]))

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {badges.map((badge) => {
        const earnedAt = earnedMap.get(badge.id)
        const isEarned = !!earnedAt

        return (
          <div
            key={badge.id}
            className="group relative"
          >
            <div
              className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-default ${
                isEarned
                  ? 'bg-white border-[#E2E8F0] shadow-sm hover:shadow-md'
                  : 'bg-[#F8FAFB] border-[#E2E8F0]/60'
              }`}
            >
              <BadgeIcon iconName={badge.icon} color={badge.color} earned={isEarned} />
              <p className={`text-[11px] font-semibold mt-2 text-center leading-tight ${
                isEarned ? 'text-[#1A1D2E]' : 'text-[#94A3B8]'
              }`}>
                {badge.name}
              </p>
            </div>

            {/* Hover Popover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 pointer-events-none">
              <div className="bg-[#1A1D2E] text-white rounded-lg p-3 shadow-xl text-center">
                <p className="font-semibold text-xs mb-1">{badge.name}</p>
                {isEarned ? (
                  <>
                    <p className="text-[11px] text-white/70 mb-1">{badge.description}</p>
                    <p className="text-[10px] text-[#10B981]">
                      Earned {new Date(earnedAt!).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3 text-white/50" />
                    <p className="text-[11px] text-white/70">{badge.hint}</p>
                  </div>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1A1D2E]" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
