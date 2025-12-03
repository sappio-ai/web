'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, BookOpen, TrendingUp, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import Orb from '@/components/orb/Orb'
import { AnalyticsService } from '@/lib/services/AnalyticsService'

interface SessionDepthAnalyticsProps {
  packId: string
}

interface SessionStats {
  total: number
  avgDuration: number
  avgCardsPerSession: number
}

interface SessionPatterns {
  byDayOfWeek: Record<string, number>
  byHourOfDay: Record<string, number>
}

export default function SessionDepthAnalytics({
  packId,
}: SessionDepthAnalyticsProps) {
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [patterns, setPatterns] = useState<SessionPatterns | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    AnalyticsService.trackSessionAnalyticsViewed(packId)
  }, [packId])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/study-packs/${packId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          total: data.sessionPatterns?.total || 0,
          avgDuration: data.sessionPatterns?.avgDuration || 0,
          avgCardsPerSession: data.sessionPatterns?.avgCardsPerSession || 0,
        })
        setPatterns(data.sessionPatterns || null)
      }
    } catch (error) {
      console.error('Error fetching session analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-[#F1F5F9] rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <div className="h-48 bg-[#F1F5F9] rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center py-12">
            <Orb pose="processing-thinking" size="lg" />
            <h3 className="text-[20px] font-bold text-[#1A1D2E] mt-6 mb-2">
              No Session Data Yet
            </h3>
            <p className="text-[#64748B] text-center text-[14px] max-w-md">
              Start reviewing flashcards to see your study sessions and habits over time. Each review session you complete will be tracked here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayData = daysOfWeek.map((day) => ({
    day,
    count: patterns?.byDayOfWeek?.[day] || 0,
  }))
  const maxDayCount = Math.max(...dayData.map((d) => d.count), 1)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const hourData = hours.map((hour) => ({
    hour,
    count: patterns?.byHourOfDay?.[hour.toString()] || 0,
  }))
  const maxHourCount = Math.max(...hourData.map((h) => h.count), 1)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  // Find peak study day and hour
  const peakDay = dayData.reduce((max, day) => day.count > max.count ? day : max, dayData[0])
  const peakHour = hourData.reduce((max, hour) => hour.count > max.count ? hour : max, hourData[0])

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Orb pose="detective-analyzing" size="sm" />
            <h3 className="text-[20px] font-bold text-[#1A1D2E]">Study Sessions</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE]">
            <TrendingUp className="w-4 h-4 text-[#5A5FF0]" />
            <span className="text-[12px] font-semibold text-[#5A5FF0]">Last 30 days</span>
          </div>
        </div>

        {/* Session Explanation Banner */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#EEF2FF] via-[#DBEAFE] to-[#F3E8FF] border border-[#C7D2FE]">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                <Info className="w-4 h-4 text-[#5A5FF0]" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[#1A1D2E] font-semibold mb-1">What&apos;s a session?</p>
              <p className="text-[12px] text-[#64748B] leading-relaxed">
                A session starts when you click <span className="text-[#1A1D2E] font-semibold">&quot;Start Review&quot;</span> and ends when you finish reviewing flashcards. 
                Each completed review counts as one session.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-[#F8FAFB] border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#5A5FF0]/10">
              <Calendar className="w-4 h-4 text-[#5A5FF0]" />
            </div>
            <div>
              <p className="text-[24px] font-black text-[#1A1D2E]">{stats.total}</p>
              <p className="text-[11px] text-[#64748B] font-medium">Sessions</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-[#E2E8F0]" />
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#22C55E]/10">
              <Clock className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-[24px] font-black text-[#1A1D2E]">{formatDuration(stats.avgDuration)}</p>
              <p className="text-[11px] text-[#64748B] font-medium">Avg Duration</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-[#E2E8F0]" />
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F59E0B]/10">
              <BookOpen className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-[24px] font-black text-[#1A1D2E]">{stats.avgCardsPerSession}</p>
              <p className="text-[11px] text-[#64748B] font-medium">Cards/Session</p>
            </div>
          </div>
        </div>

        {/* Compact Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* By Day of Week */}
          <div className="p-4 rounded-xl bg-[#F8FAFB] border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[12px] font-bold text-[#1A1D2E]">By Day</h4>
              {peakDay.count > 0 && (
                <span className="text-[11px] text-[#64748B]">
                  Peak: <span className="text-[#5A5FF0] font-semibold">{peakDay.day}</span>
                </span>
              )}
            </div>
            <div className="space-y-2">
              {dayData.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[11px] font-semibold text-[#64748B] w-8">{day.day}</span>
                  <div className="flex-1 h-6 bg-[#E2E8F0] rounded overflow-hidden relative group/bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(day.count / maxDayCount) * 100}%`,
                      }}
                      transition={{ delay: index * 0.03 + 0.1, duration: 0.4 }}
                      className="h-full bg-gradient-to-r from-[#5A5FF0] to-[#22C55E] flex items-center justify-end pr-2"
                    >
                      {day.count > 0 && (
                        <span className="text-[11px] font-bold text-white">
                          {day.count}
                        </span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* By Hour of Day - Heatmap Style */}
          <div className="p-4 rounded-xl bg-[#F8FAFB] border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[12px] font-bold text-[#1A1D2E]">By Hour</h4>
              {peakHour.count > 0 && (
                <span className="text-[11px] text-[#64748B]">
                  Peak: <span className="text-[#22C55E] font-semibold">{peakHour.hour}:00</span>
                </span>
              )}
            </div>
            
            {/* Time periods */}
            <div className="space-y-2">
              {[
                { label: 'Morning', range: '6-11', hours: [6, 7, 8, 9, 10, 11] },
                { label: 'Afternoon', range: '12-17', hours: [12, 13, 14, 15, 16, 17] },
                { label: 'Evening', range: '18-23', hours: [18, 19, 20, 21, 22, 23] },
                { label: 'Night', range: '0-5', hours: [0, 1, 2, 3, 4, 5] },
              ].map((period, periodIndex) => {
                const periodCount = period.hours.reduce((sum, h) => sum + (patterns?.byHourOfDay?.[h.toString()] || 0), 0)
                const periodMax = Math.max(...period.hours.map(h => patterns?.byHourOfDay?.[h.toString()] || 0))
                
                return (
                  <motion.div
                    key={period.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: periodIndex * 0.05 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B] font-semibold w-20">{period.label}</span>
                      <span className="text-[11px] text-[#94A3B8]">{period.range}h</span>
                    </div>
                    <div className="flex gap-1">
                      {period.hours.map((hour, hourIndex) => {
                        const count = patterns?.byHourOfDay?.[hour.toString()] || 0
                        const intensity = count > 0 ? (count / maxHourCount) : 0
                        
                        return (
                          <motion.div
                            key={hour}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: periodIndex * 0.05 + hourIndex * 0.02 }}
                            className="flex-1 h-8 rounded relative group/cell cursor-pointer"
                            style={{
                              backgroundColor: count > 0 
                                ? `rgba(34, 197, 94, ${0.2 + intensity * 0.6})` 
                                : '#F1F5F9',
                              border: count > 0 
                                ? `1px solid rgba(34, 197, 94, ${0.4 + intensity * 0.6})`
                                : '1px solid #E2E8F0'
                            }}
                          >
                            {count > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-[#065F46]">
                                  {count}
                                </span>
                              </div>
                            )}
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-[#1A1D2E] border border-[#334155] rounded px-2 py-1 whitespace-nowrap text-[11px] text-white shadow-xl">
                                {hour}:00 • {count} {count === 1 ? 'session' : 'sessions'}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Compact Summary */}
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
          <p className="text-[12px] text-[#94A3B8] text-center">
            💡 Regular review sessions lead to better retention • {Math.round((stats.total / 30) * 10) / 10} sessions/day avg
          </p>
        </div>
      </div>
    </div>
  )
}
