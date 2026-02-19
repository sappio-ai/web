'use client'

import { useEffect, useState } from 'react'
import { Flame, Zap } from 'lucide-react'
import { XP_PER_LEVEL } from '@/lib/constants/badges'

interface XPData {
  totalXp: number
  level: number
  dailyXp: number
}

interface DailyProgress {
  current: number
  goal: number
}

export default function XPWidget() {
  const [xp, setXp] = useState<XPData | null>(null)
  const [daily, setDaily] = useState<DailyProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function fetchXP() {
      try {
        const res = await fetch('/api/user/xp')
        if (!res.ok) return
        const data = await res.json()
        if (data.success) {
          setXp(data.xp)
          setDaily(data.dailyProgress)
        }
      } catch (err) {
        console.error('Failed to fetch XP:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchXP()
  }, [])

  useEffect(() => {
    if (!loading && xp) {
      const timer = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(timer)
    }
  }, [loading, xp])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden animate-pulse h-full">
        <div className="h-[3px] bg-gray-200" />
        <div className="p-5">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
          <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto mb-4" />
          <div className="h-2 bg-gray-200 rounded w-full mb-3" />
          <div className="h-2 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!xp) return null

  const xpInCurrentLevel = xp.totalXp % XP_PER_LEVEL
  const levelProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100
  const dailyCurrent = daily?.current || 0
  const dailyGoal = daily?.goal || 100
  const dailyProgress = Math.min((dailyCurrent / dailyGoal) * 100, 100)
  const goalComplete = dailyCurrent >= dailyGoal

  // Conic gradient for level ring
  const conicStyle = {
    background: `conic-gradient(#5A5FF0 ${mounted ? levelProgress * 3.6 : 0}deg, #E2E8F0 0deg)`,
    transition: 'background 1s ease-out',
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.06)] h-full">
      {/* Gradient accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#5A5FF0] via-[#8B5CF6] to-[#5A5FF0]" />

      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-[#1A1D2E]">Your Progress</h3>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Zap className="w-3.5 h-3.5 text-[#5A5FF0]" />
            <span className="font-semibold tabular-nums">{xp.totalXp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Level Circle with conic-gradient ring */}
        <div className="flex justify-center mb-5">
          <div className="relative w-[56px] h-[56px] rounded-full flex items-center justify-center" style={conicStyle}>
            <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#5A5FF0] flex items-center justify-center">
                <span className="text-white text-lg font-bold">{xp.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[#64748B]">Level {xp.level}</span>
            <span className="text-[11px] text-[#94A3B8] tabular-nums">
              {xpInCurrentLevel} / {XP_PER_LEVEL}
            </span>
          </div>
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5A5FF0] rounded-full"
              style={{
                width: mounted ? `${levelProgress}%` : '0%',
                transition: 'width 1s ease-out',
              }}
            />
          </div>
        </div>

        {/* Daily Goal */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Flame className={`w-3.5 h-3.5 ${goalComplete ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
              <span className="text-[11px] font-medium text-[#64748B]">Daily Goal</span>
            </div>
            <span className={`text-[11px] tabular-nums font-medium ${goalComplete ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
              {dailyCurrent} / {dailyGoal}
            </span>
          </div>
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${goalComplete ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
              style={{
                width: mounted ? `${dailyProgress}%` : '0%',
                transition: 'width 1s ease-out 0.2s',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
