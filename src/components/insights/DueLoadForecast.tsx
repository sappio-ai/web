'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalyticsService } from '@/lib/services/AnalyticsService'

interface DueLoadForecastProps {
  packId: string
}

interface DayForecast {
  date: string
  dayName: string
  dueCount: number
  packBreakdown: Record<string, number>
}

export default function DueLoadForecast({ packId }: DueLoadForecastProps) {
  const [forecast, setForecast] = useState<DayForecast[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchForecast()
    AnalyticsService.trackForecastViewed(packId)
  }, [packId])

  const fetchForecast = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/study-packs/${packId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setForecast(data.dueLoadForecast || [])
      }
    } catch (error) {
      console.error('Error fetching forecast:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-[#F8FAFB] border-[#E2E8F0] text-[#94A3B8]'
    if (count <= 10) return 'bg-[#D1FAE5] border-[#6EE7B7] text-[#065F46]'
    if (count <= 30) return 'bg-[#FED7AA] border-[#FB923C] text-[#C2410C]'
    return 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]'
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 0.3
    if (count <= 10) return 0.5
    if (count <= 30) return 0.7
    return 1
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-6" />
          <div className="grid grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-24 bg-[#F1F5F9] rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...forecast.map((day) => day.dueCount), 1)

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-[#5A5FF0]" />
          <h3 className="text-[20px] font-bold text-[#1A1D2E]">Due Load Forecast</h3>
        </div>
        <p className="text-[#64748B] text-[14px] mb-6">
          Plan your study schedule for the next 7 days
        </p>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {forecast.map((day, index) => {
            const colorClass = getColorClass(day.dueCount)
            const intensity = getIntensity(day.dueCount)
            const isToday = index === 0

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group/day"
              >
                <div
                  className={`relative p-4 rounded-lg border transition-all ${colorClass} ${
                    day.dueCount > 0 ? 'hover:scale-105 cursor-pointer' : ''
                  }`}
                  style={{ opacity: day.dueCount === 0 ? 0.6 : 1 }}
                >
                  {/* Today indicator */}
                  {isToday && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#5A5FF0] rounded-full border-2 border-white shadow-sm" />
                  )}

                  {/* Day name */}
                  <p className="text-[11px] font-bold text-center mb-2 uppercase tracking-wider">
                    {day.dayName}
                  </p>

                  {/* Date */}
                  <p className="text-[12px] text-center text-[#64748B] mb-3">
                    {new Date(day.date).getDate()}
                  </p>

                  {/* Count */}
                  <div className="text-center">
                    <p className="text-[24px] font-black">
                      {day.dueCount}
                    </p>
                    <p className="text-[11px] mt-1 font-medium">
                      {day.dueCount === 1 ? 'card' : 'cards'}
                    </p>
                  </div>

                  {/* Tooltip on hover */}
                  {day.dueCount > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-[#1A1D2E] border border-[#334155] rounded-lg p-3 shadow-xl whitespace-nowrap">
                        <p className="text-[11px] font-bold text-white mb-1">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-[11px] text-[#94A3B8]">
                          {day.dueCount} {day.dueCount === 1 ? 'card' : 'cards'} due
                        </p>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                          <div className="w-2 h-2 bg-[#1A1D2E] border-r border-b border-[#334155] transform rotate-45" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#D1FAE5] border border-[#6EE7B7]" />
              <span className="text-[12px] text-[#64748B] font-medium">Light (1-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#FED7AA] border border-[#FB923C]" />
              <span className="text-[12px] text-[#64748B] font-medium">Moderate (11-30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#FEE2E2] border border-[#FCA5A5]" />
              <span className="text-[12px] text-[#64748B] font-medium">Heavy (31+)</span>
            </div>
          </div>
          <p className="text-[12px] text-[#94A3B8] text-center mt-3">
            💡 Tip: Spread out your reviews to avoid heavy days
          </p>
        </div>
      </div>
    </div>
  )
}
