'use client'

import { useState, useEffect, useRef } from 'react'

interface PersonalTimerProps {
  onStatusChange: (status: 'idle' | 'studying' | 'break') => void
  defaultWorkMinutes?: number
  defaultBreakMinutes?: number
}

export default function PersonalTimer({
  onStatusChange,
  defaultWorkMinutes = 25,
  defaultBreakMinutes = 5,
}: PersonalTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(defaultWorkMinutes * 60)
  const [workMinutes, setWorkMinutes] = useState(defaultWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState(defaultBreakMinutes)
  const [showSettings, setShowSettings] = useState(false)
  const [editWork, setEditWork] = useState(defaultWorkMinutes)
  const [editBreak, setEditBreak] = useState(defaultBreakMinutes)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    onStatusChange(isRunning ? (isBreak ? 'break' : 'studying') : 'idle')
  }, [isRunning, isBreak, onStatusChange])

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => setRemainingSeconds(p => p - 1), 1000)
    } else if (isRunning && remainingSeconds === 0) {
      handleComplete()
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, remainingSeconds])

  const handleComplete = () => {
    audioRef.current?.play().catch(() => {})
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: isBreak ? 'Break over!' : 'Time for a break!',
        icon: '/logo.png',
      })
    }
    const nextIsBreak = !isBreak
    setIsBreak(nextIsBreak)
    setRemainingSeconds(nextIsBreak ? breakMinutes * 60 : workMinutes * 60)
  }

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsBreak(false)
    setRemainingSeconds(workMinutes * 60)
  }

  const handleSaveSettings = () => {
    setWorkMinutes(editWork)
    setBreakMinutes(editBreak)
    setShowSettings(false)
    setIsRunning(false)
    setIsBreak(false)
    setRemainingSeconds(editWork * 60)
  }

  const total = isBreak ? breakMinutes * 60 : workMinutes * 60
  const progress = total > 0 ? remainingSeconds / total : 0
  const mins = Math.floor(remainingSeconds / 60)
  const secs = remainingSeconds % 60

  if (showSettings) {
    return (
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-56">
        <audio ref={audioRef} src="/notification.mp3" preload="auto" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/50 uppercase tracking-wider">Personal</span>
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
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      {/* Minimal floating timer */}
      <div className="flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl">
        {/* Progress ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke={isBreak ? '#10b981' : '#f59e0b'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 * (1 - progress)}
              className="transition-all duration-1000"
            />
          </svg>
          {isRunning && (
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isBreak ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                 style={{ animationDuration: '2s' }} />
          )}
        </div>

        {/* Time & Label */}
        <div className="flex-1">
          <div className="text-2xl font-light text-white tabular-nums tracking-tight">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isBreak ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isBreak ? 'Break' : 'Focus'}
            </span>
            <span className="text-xs text-white/30">• You</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleReset}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          <button
            onClick={isRunning ? () => setIsRunning(false) : handleStart}
            className={`p-2 rounded-lg transition-all ${
              isRunning 
                ? 'text-white/60 hover:text-white hover:bg-white/10' 
                : isBreak 
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            }`}
          >
            {isRunning ? (
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
      </div>
    </div>
  )
}
