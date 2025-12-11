'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { RoomMemberWithUser, MemberStatus, PresenceState } from '@/lib/types/rooms'

interface MemberSidebarProps {
  roomId: string
  userId: string
  members: RoomMemberWithUser[]
}

interface PresencePayload {
  [key: string]: {
    user_id: string
    status: MemberStatus
    timer_running?: boolean
    full_name?: string
    avatar_url?: string
  }[]
}

export default function MemberSidebar({ roomId, userId, members }: MemberSidebarProps) {
  const [presenceState, setPresenceState] = useState<Map<string, PresenceState>>(new Map())
  const [isCollapsed, setIsCollapsed] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get current user's member info
  const currentMember = members.find(m => m.user_id === userId)

  // Track own presence
  const trackPresence = useCallback(async (status: MemberStatus = 'idle') => {
    const channel = supabase.channel(`room:${roomId}:presence`)
    
    await channel.track({
      user_id: userId,
      status,
      timer_running: status === 'studying',
      full_name: currentMember?.user?.fullName || 'Anonymous',
      avatar_url: currentMember?.user?.avatarUrl || null,
      online_at: new Date().toISOString(),
    })
  }, [roomId, userId, currentMember, supabase])

  // Subscribe to presence changes
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}:presence`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresencePayload>()
        const newPresenceMap = new Map<string, PresenceState>()

        // Process presence state
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              newPresenceMap.set(presence.user_id, {
                userId: presence.user_id,
                user: {
                  fullName: presence.full_name || null,
                  avatarUrl: presence.avatar_url || null,
                },
                status: presence.status || 'idle',
                lastSeen: presence.online_at || new Date().toISOString(),
                timerRunning: presence.timer_running || false,
              })
            }
          })
        })

        setPresenceState(newPresenceMap)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setPresenceState(prev => {
          const updated = new Map(prev)
          newPresences.forEach((presence: any) => {
            if (presence.user_id) {
              updated.set(presence.user_id, {
                userId: presence.user_id,
                user: {
                  fullName: presence.full_name || null,
                  avatarUrl: presence.avatar_url || null,
                },
                status: presence.status || 'idle',
                lastSeen: presence.online_at || new Date().toISOString(),
                timerRunning: presence.timer_running || false,
              })
            }
          })
          return updated
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setPresenceState(prev => {
          const updated = new Map(prev)
          leftPresences.forEach((presence: any) => {
            if (presence.user_id) {
              updated.delete(presence.user_id)
            }
          })
          return updated
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track own presence when subscribed
          await trackPresence('idle')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, userId, supabase, trackPresence])


  // Get member display info with presence
  const getMemberWithPresence = (member: RoomMemberWithUser) => {
    const presence = presenceState.get(member.user_id)
    const isOnline = !!presence
    const status: MemberStatus = presence?.status || 'offline'
    const timerRunning = presence?.timerRunning || false

    return {
      ...member,
      isOnline,
      status,
      timerRunning,
    }
  }

  // Sort members: online first, then by name
  const sortedMembers = [...members]
    .map(getMemberWithPresence)
    .sort((a, b) => {
      // Online users first
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      // Then by name
      const nameA = a.user?.fullName || ''
      const nameB = b.user?.fullName || ''
      return nameA.localeCompare(nameB)
    })

  const onlineCount = sortedMembers.filter(m => m.isOnline).length

  // Get status display text
  const getStatusText = (status: MemberStatus, timerRunning: boolean): string => {
    if (timerRunning || status === 'studying') return 'Studying'
    if (status === 'break') return 'On Break'
    if (status === 'idle') return 'Idle'
    return 'Offline'
  }

  // Get status color
  const getStatusColor = (status: MemberStatus, isOnline: boolean): string => {
    if (!isOnline) return 'bg-gray-500'
    if (status === 'studying') return 'bg-green-500'
    if (status === 'break') return 'bg-cyan-500'
    return 'bg-yellow-500' // idle
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-24 left-6 z-30 flex items-center gap-2 px-3 py-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-black/40 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        <span className="text-sm font-medium">{onlineCount}</span>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </button>
    )
  }

  // Calculate max height to avoid overlapping with timers (bottom-24 = 6rem = 96px, plus timer height ~200px)
  // Sidebar starts at top-24 (96px), so max-height = 100vh - 96px (top) - 320px (bottom space for timers)
  return (
    <div className="fixed top-24 left-6 z-30 w-56 max-h-[calc(100vh-26rem)] bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span className="text-sm font-medium text-white/80">Members</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">{onlineCount}/{members.length}</span>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 text-white/40 hover:text-white rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Member List - scrollable area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
              member.user_id === userId ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            {/* Avatar with status indicator */}
            <div className="relative flex-shrink-0">
              {member.user?.avatarUrl ? (
                <img
                  src={member.user.avatarUrl}
                  alt={member.user.fullName || 'Member'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {(member.user?.fullName || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black/50 ${getStatusColor(member.status, member.isOnline)}`}
              />
            </div>

            {/* Name and status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-white/90 truncate">
                  {member.user?.fullName || 'Anonymous'}
                </span>
                {member.user_id === userId && (
                  <span className="text-xs text-white/40">(you)</span>
                )}
              </div>
              <span className={`text-xs ${
                member.isOnline 
                  ? member.status === 'studying' 
                    ? 'text-green-400' 
                    : member.status === 'break' 
                      ? 'text-cyan-400' 
                      : 'text-yellow-400'
                  : 'text-white/30'
              }`}>
                {getStatusText(member.status, member.timerRunning)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export a function to update presence status from other components
export function usePresenceUpdate(roomId: string, userId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const updateStatus = useCallback(async (status: MemberStatus) => {
    const channel = supabase.channel(`room:${roomId}:presence`)
    await channel.track({
      user_id: userId,
      status,
      timer_running: status === 'studying',
      online_at: new Date().toISOString(),
    })
  }, [roomId, userId, supabase])

  return { updateStatus }
}
