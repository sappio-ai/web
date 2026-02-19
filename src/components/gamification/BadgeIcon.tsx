'use client'

import {
  Package, Star, PenTool, Trophy, Flame, Crown,
  Hash, Zap, Sparkles, Users, BookOpen, GraduationCap, Lock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Package, Star, PenTool, Trophy, Flame, Crown,
  Hash, Zap, Sparkles, Users, BookOpen, GraduationCap,
}

interface BadgeIconProps {
  iconName: string
  color: string
  earned: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-11 h-11', icon: 'w-5 h-5' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
}

export default function BadgeIcon({ iconName, color, earned, size = 'md' }: BadgeIconProps) {
  const Icon = ICON_MAP[iconName] || Star
  const s = SIZES[size]

  if (!earned) {
    return (
      <div
        className={`${s.container} rounded-xl border-2 border-dashed border-[#CBD5E1] flex items-center justify-center bg-[#F8FAFB]`}
      >
        <Lock className={`${s.icon} text-[#CBD5E1]`} />
      </div>
    )
  }

  return (
    <div
      className={`${s.container} rounded-xl flex items-center justify-center shadow-sm`}
      style={{
        backgroundColor: `${color}15`,
        boxShadow: `0 0 0 2px ${color}30`,
      }}
    >
      <Icon className={s.icon} style={{ color }} strokeWidth={2.2} />
    </div>
  )
}
