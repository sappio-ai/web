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
    if (count === 0) return 'bg-white/5 border-white/10 text-gray-500'
    if (count <= 10) return 'bg-green-500/20 border-green-500/30 text-green-400'
    if (count <= 30) return 'bg-orange-500/20 border-orange-500/30 text-orange-400'
    return 'bg-red-500/20 border-red-500/30 text-red-400'
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 0.3
    if (count <= 10) return 0.5
    if (count <= 30) return 0.7
    return 1
  }

  if (isLoading) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/5 rounded-lg animate-pulse"
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
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-[#a8d5d5]" />
          <h3 className="text-xl font-bold text-white">Due Load Forecast</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">
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
                  style={{ opacity: day.dueCount === 0 ? 0.5 : intensity }}
                >
                  {/* Today indicator */}
                  {isToday && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#a8d5d5] rounded-full border-2 border-[#0A0F1A]" />
                  )}

                  {/* Day name */}
                  <p className="text-xs font-bold text-center mb-2 text-white">
                    {day.dayName}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-center text-gray-400 mb-3">
                    {new Date(day.date).getDate()}
                  </p>

                  {/* Count */}
                  <div className="text-center">
                    <p className="text-2xl font-black">
                      {day.dueCount}
                    </p>
                    <p className="text-xs mt-1">
                      {day.dueCount === 1 ? 'card' : 'cards'}
                    </p>
                  </div>

                  {/* Tooltip on hover */}
                  {day.dueCount > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-[#1a1f2e] border border-white/20 rounded-lg p-3 shadow-xl whitespace-nowrap">
                        <p className="text-xs font-bold text-white mb-1">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {day.dueCount} {day.dueCount === 1 ? 'card' : 'cards'} due
                        </p>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                          <div className="w-2 h-2 bg-[#1a1f2e] border-r border-b border-white/20 transform rotate-45" />
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
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
              <span className="text-xs text-gray-400">Light (1-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />
              <span className="text-xs text-gray-400">Moderate (11-30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />
              <span className="text-xs text-gray-400">Heavy (31+)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            💡 Tip: Spread out your reviews to avoid heavy days
          </p>
        </div>
      </div>
    </div>
  )
}
