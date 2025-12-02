'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import Orb from '@/components/orb/Orb'
import { AnalyticsService } from '@/lib/services/AnalyticsService'

interface PerformanceTrendsProps {
  packId: string
}

interface QuizPerformancePoint {
  date: string
  score: number
  duration: number
}

export default function PerformanceTrends({ packId }: PerformanceTrendsProps) {
  const [performance, setPerformance] = useState<QuizPerformancePoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  useEffect(() => {
    fetchPerformance()
    AnalyticsService.trackPerformanceChartViewed(packId)
  }, [packId])

  const fetchPerformance = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/study-packs/${packId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setPerformance(data.quizPerformance || [])
      }
    } catch (error) {
      console.error('Error fetching performance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-6" />
          <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (performance.length < 2) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Orb pose="quiz-master" size="lg" />
            <h3 className="text-xl font-bold text-white mt-6 mb-2">
              Take More Quizzes
            </h3>
            <p className="text-gray-400 text-center text-sm max-w-md">
              Complete at least 2 quizzes to see your performance trends and
              track your improvement over time.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate chart dimensions and scaling
  const chartWidth = 800
  const chartHeight = 300
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const maxScore = 100
  const minScore = 0

  // Create points for the line
  const points = performance.map((point, index) => {
    const x = padding.left + (index / (performance.length - 1)) * innerWidth
    const y =
      padding.top +
      innerHeight -
      ((point.score - minScore) / (maxScore - minScore)) * innerHeight
    return { x, y, ...point }
  })

  // Create path for the line
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      return `L ${point.x} ${point.y}`
    })
    .join(' ')

  // Create path for the gradient fill
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`

  // Calculate average score
  const avgScore =
    performance.reduce((sum, p) => sum + p.score, 0) / performance.length

  // Determine trend
  const firstScore = performance[0].score
  const lastScore = performance[performance.length - 1].score
  const trend = lastScore > firstScore ? 'improving' : lastScore < firstScore ? 'declining' : 'stable'

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {trend === 'improving' ? (
              <Orb pose="progress-growth" size="sm" />
            ) : (
              <TrendingUp className="w-6 h-6 text-[#a8d5d5]" />
            )}
            <h3 className="text-xl font-bold text-white">Performance Trends</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Average Score</p>
              <p className="text-lg font-bold text-white">{Math.round(avgScore)}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Trend</p>
              <p
                className={`text-lg font-bold ${
                  trend === 'improving'
                    ? 'text-green-400'
                    : trend === 'declining'
                      ? 'text-red-400'
                      : 'text-gray-400'
                }`}
              >
                {trend === 'improving' ? '↗' : trend === 'declining' ? '↘' : '→'}
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Track your quiz performance over time
        </p>

        {/* Chart */}
        <div className="relative w-full overflow-visible">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
            style={{ minHeight: '300px' }}
          >
            <defs>
              {/* Gradient for the line */}
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              {/* Gradient for the area fill */}
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => {
              const y =
                padding.top +
                innerHeight -
                ((value - minScore) / (maxScore - minScore)) * innerHeight
              return (
                <g key={value}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="12"
                  >
                    {value}%
                  </text>
                </g>
              )
            })}

            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Line */}
            <motion.path
              d={linePath}
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === index ? 8 : 6}
                  fill="#0A0F1A"
                  stroke={
                    point.score >= 70
                      ? '#10b981'
                      : point.score >= 50
                        ? '#f59e0b'
                        : '#ef4444'
                  }
                  strokeWidth="3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                />


              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, index) => {
              // Show every other label to avoid crowding
              if (index % Math.ceil(points.length / 5) !== 0 && index !== points.length - 1)
                return null

              return (
                <text
                  key={index}
                  x={point.x}
                  y={padding.top + innerHeight + 20}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="12"
                >
                  {new Date(point.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </text>
              )
            })}
          </svg>

          {/* Tooltip outside SVG */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                top: `${(points[hoveredPoint].y / chartHeight) * 100}%`,
                transform: 'translate(-50%, calc(-100% - 16px))',
              }}
            >
              <div className="bg-[#1a1f2e] border border-white/20 rounded-lg p-3 shadow-xl whitespace-nowrap">
                <p className="text-xs font-bold text-white mb-1">
                  {new Date(points[hoveredPoint].date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm font-bold text-[#a8d5d5] mb-1">
                  Score: {Math.round(points[hoveredPoint].score)}%
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    {Math.floor(points[hoveredPoint].duration / 60)}m{' '}
                    {points[hoveredPoint].duration % 60}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400">
              <span className="text-white font-medium">{performance.length}</span> quiz
              {performance.length === 1 ? '' : 'zes'} completed
            </p>
            <p className="text-gray-400">
              {trend === 'improving' && (
                <span className="text-green-400 font-medium">
                  📈 Keep up the great work!
                </span>
              )}
              {trend === 'declining' && (
                <span className="text-orange-400 font-medium">
                  💪 Review your weak topics
                </span>
              )}
              {trend === 'stable' && (
                <span className="text-gray-400 font-medium">
                  📊 Consistent performance
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
