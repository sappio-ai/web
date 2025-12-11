'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TimerState } from '@/lib/types/rooms'
import { createBrowserClient } from '@/lib/supabase/client'

interface GlobalTimerProps {
  roomId: string
  isCreator: boolean
  initialState: TimerState
  workMinutes: number
  breakMinutes: number
  onDurationUpdate?: (workMinutes: number, breakMinutes: number) => void
}

export default function GlobalTimer({
  roomId,
  isCreator,
  initialState,
  workMinutes,
  breakMinutes,
  onDurationUpdate,
}: GlobalTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>(initialState)
  const [showSettings, setShowSettings] = useState(false)
  const [editWork, setEditWork] = useState(workMinutes)
  const [editBreak, setEditBreak] = useState(breakMinutes)
  const [, setTick] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isCompletingRef = useRef(false)
  const supabase = createBrowserClient()

  const calcRemaining = useCallback((state: TimerState): number => {
    if (!state.isRunning || !state.startedAt) return state.remainingSeconds
    const elapsed = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000)
    return Math.max(0, state.remainingSeconds - elapsed)
  }, [])

  const handleComplete = useCallback(async () => {
    if (isCompletingRef.current) return
    isCompletingRef.current = true
    try {
      const res = await fetch(`/api/rooms/${roomId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.timerState) setTimerState(data.timerState)
      }
    } finally {
      isCompletingRef.current = false
    }
  }, [roomId])

  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        const remaining = calcRemaining(timerState)
        if (remaining <= 0 && isCreator) handleComplete()
        else setTick(t => t + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerState.isRunning, timerState.startedAt, timerState.remainingSeconds, calcRemaining, isCreator, handleComplete])

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:timer`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'study_rooms', filter: `id=eq.${roomId}`,
      }, (payload) => {
        const ts = (payload.new.meta_json as any)?.timer_state
        if (ts) setTimerState({
          isRunning: ts.is_running || false,
          isBreak: ts.is_break || false,
          remainingSeconds: ts.remaining_seconds || 0,
          startedAt: ts.started_at,
          pausedAt: ts.paused_at,
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])

  const apiCall = async (action: string, extra = {}) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.timerState) setTimerState(data.timerState)
      }
    } catch (e) { console.error(e) }
  }

  const handleSaveSettings = async () => {
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pomodoroWorkMinutes: editWork, pomodoroBreakMinutes: editBreak }),
      })
      if (!timerState.isRunning) await apiCall('reset')
      setShowSettings(false)
      onDurationUpdate?.(editWork, editBreak)
    } catch (e) { console.error(e) }
  }

  const displaySecs = calcRemaining(timerState)
  const total = timerState.isBreak ? breakMinutes * 60 : workMinutes * 60
  const progress = total > 0 ? displaySecs / total : 0
  const mins = Math.floor(displaySecs / 60)
  const secs = displaySecs % 60


  if (showSettings && isCreator) {
    return (
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-56">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/50 uppercase tracking-wider">Room Timer</span>
          <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 block mb-1">Focus (min)</label>
            <input
              type="number" min="1" max="120" value={editWork}
              onChange={(e) => setEditWork(parseInt(e.target.value) || 25)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Break (min)</label>
            <input
              type="number" min="1" max="30" value={editBreak}
              onChange={(e) => setEditBreak(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      {/* Minimal floating timer */}
      <div className="flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl">
        {/* Progress ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke={timerState.isBreak ? '#06b6d4' : '#a855f7'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 * (1 - progress)}
              className="transition-all duration-1000"
            />
          </svg>
          {timerState.isRunning && (
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${timerState.isBreak ? 'bg-cyan-500' : 'bg-purple-500'}`} 
                 style={{ animationDuration: '2s' }} />
          )}
        </div>

        {/* Time & Label */}
        <div className="flex-1">
          <div className="text-2xl font-light text-white tabular-nums tracking-tight">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${timerState.isBreak ? 'text-cyan-400' : 'text-purple-400'}`}>
              {timerState.isBreak ? 'Break' : 'Focus'}
            </span>
            <span className="text-xs text-white/30">• Room</span>
          </div>
        </div>

        {/* Controls */}
        {isCreator && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => apiCall('reset')}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <button
              onClick={() => timerState.isRunning ? apiCall('pause') : apiCall('start', { isBreak: timerState.isBreak })}
              className={`p-2 rounded-lg transition-all ${
                timerState.isRunning 
                  ? 'text-white/60 hover:text-white hover:bg-white/10' 
                  : timerState.isBreak 
                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                    : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              }`}
            >
              {timerState.isRunning ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => { setEditWork(workMinutes); setEditBreak(breakMinutes); setShowSettings(true) }}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Non-creator status */}
      {!isCreator && !timerState.isRunning && (
        <div className="text-xs text-white/30 mt-1 ml-4">Waiting for host</div>
      )}
    </div>
  )
}
