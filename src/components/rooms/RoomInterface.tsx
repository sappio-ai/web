'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RoomWithMembers, Message, MemberStatus, SharedTool } from '@/lib/types/rooms'
import GlobalTimer from './GlobalTimer'
import PersonalTimer from './PersonalTimer'
import RoomChat from './RoomChat'
import MemberSidebar from './MemberSidebar'
import SharedTab from './SharedTab'
import ToolModal from './ToolModal'
import RoomLeaderboard from './RoomLeaderboard'
import { createBrowserClient } from '@supabase/ssr'

interface RoomInterfaceProps {
  room: RoomWithMembers
  userId: string
  isCreator: boolean
}

export default function RoomInterface({ room, userId, isCreator }: RoomInterfaceProps) {
  const [sharedOpen, setSharedOpen] = useState(false)
  const [workMinutes, setWorkMinutes] = useState(room.pomodoroWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState(room.pomodoroBreakMinutes)
  const [personalStatus, setPersonalStatus] = useState<MemberStatus>('idle')
  const [toolModalOpen, setToolModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<SharedTool | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Update presence when personal timer status changes
  const handlePersonalStatusChange = useCallback(async (status: string) => {
    const memberStatus: MemberStatus = status === 'studying' ? 'studying' : status === 'break' ? 'break' : 'idle'
    setPersonalStatus(memberStatus)
    
    // Update presence in the channel
    const channel = supabase.channel(`room:${room.id}:presence`)
    const currentMember = room.members.find(m => m.user_id === userId)
    
    await channel.track({
      user_id: userId,
      status: memberStatus,
      timer_running: memberStatus === 'studying',
      full_name: currentMember?.user?.fullName || 'Anonymous',
      avatar_url: currentMember?.user?.avatarUrl || null,
      online_at: new Date().toISOString(),
    })
  }, [room.id, room.members, userId, supabase])

  const getInitialTimerState = () => {
    const timerState = room.metaJson?.timer_state
    if (timerState) {
      return {
        isRunning: timerState.is_running || false,
        isBreak: timerState.is_break || false,
        remainingSeconds: timerState.remaining_seconds || workMinutes * 60,
        startedAt: timerState.started_at,
        pausedAt: timerState.paused_at,
      }
    }
    return { isRunning: false, isBreak: false, remainingSeconds: workMinutes * 60 }
  }

  const initialTimerState = getInitialTimerState()

  useEffect(() => {
    const navbar = document.querySelector('nav')
    const footer = document.querySelector('footer')
    if (navbar) navbar.style.display = 'none'
    if (footer) footer.style.display = 'none'
    return () => {
      if (navbar) navbar.style.display = ''
      if (footer) footer.style.display = ''
    }
  }, [])

  const backgroundUrl = `/${room.backgroundTheme}.png`

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Exit Button - Top Left */}
      <button
        onClick={() => router.push('/rooms')}
        className="fixed top-5 left-5 z-50 p-3 bg-black/20 backdrop-blur-md hover:bg-black/30 border border-white/10 text-white/80 hover:text-white rounded-2xl transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Room Info - Top Center */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl">
          <h1 className="text-base font-medium text-white/90">{room.name}</h1>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-1.5 text-white/60 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span>{room.memberCount || 1}</span>
          </div>
          {isCreator && (
            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-full">Host</span>
          )}
        </div>
      </div>

      {/* Action Buttons - Top Right */}
      <div className="fixed top-5 right-5 z-40 flex items-center gap-2">
        <button className="p-3 bg-black/20 backdrop-blur-md hover:bg-black/30 border border-white/10 text-white/60 hover:text-white rounded-2xl transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
        </button>
        {isCreator && (
          <button className="p-3 bg-black/20 backdrop-blur-md hover:bg-black/30 border border-white/10 text-white/60 hover:text-white rounded-2xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>


      {/* Floating Timers - Bottom Left */}
      <div className="fixed bottom-24 left-6 z-30 flex flex-col gap-4">
        <GlobalTimer
          roomId={room.id}
          isCreator={isCreator}
          initialState={initialTimerState}
          workMinutes={workMinutes}
          breakMinutes={breakMinutes}
          onDurationUpdate={(newWork, newBreak) => {
            setWorkMinutes(newWork)
            setBreakMinutes(newBreak)
          }}
        />
        <PersonalTimer
          onStatusChange={handlePersonalStatusChange}
          defaultWorkMinutes={workMinutes}
          defaultBreakMinutes={breakMinutes}
        />
      </div>

      {/* Member Sidebar - Left Side (below exit button) */}
      <MemberSidebar
        roomId={room.id}
        userId={userId}
        members={room.members}
      />

      {/* Leaderboard - Below Member Sidebar */}
      <div className="fixed top-20 left-6 z-30 w-64" style={{ top: 'calc(50% + 20px)' }}>
        <RoomLeaderboard roomId={room.id} currentUserId={userId} />
      </div>

      {/* Chat Panel - Right Side */}
      <div className="fixed top-20 right-6 bottom-6 w-80 z-30">
        <RoomChat
          roomId={room.id}
          userId={userId}
          onToolOpen={(message: Message) => {
            // Convert message to SharedTool format
            if (message.messageType === 'tool_share' && message.metaJson?.sharedTool) {
              setSelectedTool(message.metaJson.sharedTool)
              setToolModalOpen(true)
            }
          }}
        />
      </div>

      {/* Shared Panel - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Toggle Button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={() => setSharedOpen(!sharedOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-black/40 transition-all"
          >
            <span className="text-sm font-medium">Shared</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${sharedOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        {/* Expandable Panel */}
        <div 
          className={`bg-black/40 backdrop-blur-2xl border-t border-white/10 transition-all duration-500 ease-out overflow-hidden ${
            sharedOpen ? 'max-h-[50vh] py-6' : 'max-h-0'
          }`}
        >
          <SharedTab
            roomId={room.id}
            userId={userId}
            isOpen={sharedOpen}
            onToolOpen={(tool: SharedTool) => {
              setSelectedTool(tool)
              setToolModalOpen(true)
            }}
          />
        </div>
      </div>

      {/* Tool Modal */}
      <ToolModal
        isOpen={toolModalOpen}
        tool={selectedTool}
        roomId={room.id}
        userId={userId}
        onClose={() => {
          setToolModalOpen(false)
          setSelectedTool(null)
        }}
        onComplete={async (result) => {
          // Modal will handle posting to chat
          console.log('Tool completed:', result)
        }}
      />
    </div>
  )
}
