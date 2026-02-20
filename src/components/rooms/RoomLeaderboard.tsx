'use client'

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  userId: string
  name: string
  avatarUrl: string | null
  weeklyXp: number
  level: number
  rank: number
}

interface RoomLeaderboardProps {
  roomId: string
  currentUserId: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <svg className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
  if (rank === 2) {
    return (
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
  if (rank === 3) {
    return (
      <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
  return <span className="w-5 text-center text-sm font-medium text-white/50">#{rank}</span>
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
      <div className="w-5 h-5 rounded bg-white/10" />
      <div className="w-8 h-8 rounded-full bg-white/10" />
      <div className="flex-1">
        <div className="h-3.5 w-24 rounded bg-white/10" />
      </div>
      <div className="h-3.5 w-12 rounded bg-white/10" />
    </div>
  )
}

export default function RoomLeaderboard({ roomId, currentUserId }: RoomLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/rooms/${roomId}/leaderboard`)
        if (!res.ok) return
        const data = await res.json()
        setEntries(data.leaderboard || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [roomId])

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-sm font-medium text-white/90">Weekly Leaderboard</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40">Resets Monday</span>
          <svg
            className={`w-4 h-4 text-white/40 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="px-2 pb-2">
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : entries.length === 0 || entries.every(e => e.weeklyXp === 0) ? (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-white/40">No XP earned this week yet.</p>
              <p className="text-xs text-white/30 mt-1">Review cards or complete quizzes to earn XP!</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {entries.map(entry => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    entry.userId === currentUserId
                      ? 'bg-[#5A5FF0]/20 border border-[#5A5FF0]/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Rank */}
                  <RankIcon rank={entry.rank} />

                  {/* Avatar */}
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#5A5FF0]/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-white/80">
                        {getInitials(entry.name)}
                      </span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">
                      {entry.name}
                      {entry.userId === currentUserId && (
                        <span className="text-white/40 ml-1 text-xs">(you)</span>
                      )}
                    </p>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs font-semibold">{entry.weeklyXp}</span>
                  </div>

                  {/* Level badge */}
                  <div className="w-6 h-6 rounded-full bg-[#5A5FF0]/40 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/90">{entry.level}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
