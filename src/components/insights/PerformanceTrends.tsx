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
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-6" />
          <div className="h-64 bg-[#F1F5F9] rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (performance.length < 2) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center py-12">
            <Orb pose="quiz-master" size="lg" />
            <h3 className="text-[20px] font-bold text-[#1A1D2E] mt-6 mb-2">
              Take More Quizzes
            </h3>
            <p className="text-[#64748B] text-center text-[14px] max-w-md">
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
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {trend === 'improving' ? (
              <Orb pose="progress-growth" size="sm" />
            ) : (
              <TrendingUp className="w-6 h-6 text-[#5A5FF0]" />
            )}
            <h3 className="text-[20px] font-bold text-[#1A1D2E]">Performance Trends</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Average Score</p>
              <p className="text-[18px] font-bold text-[#1A1D2E]">{Math.round(avgScore)}%</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Trend</p>
              <p
                className={`text-[18px] font-bold ${
                  trend === 'improving'
                    ? 'text-[#10B981]'
                    : trend === 'declining'
                      ? 'text-[#DC2626]'
                      : 'text-[#64748B]'
                }`}
              >
                {trend === 'improving' ? '↗' : trend === 'declining' ? '↘' : '→'}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[#64748B] text-[14px] mb-6">
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
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
              {/* Gradient for the area fill */}
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0.05" />
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
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748B"
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
                  fill="#FFFFFF"
                  stroke={
                    point.score >= 70
                      ? '#10B981'
                      : point.score >= 50
                        ? '#F59E0B'
                        : '#DC2626'
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
                  fill="#64748B"
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
              <div className="bg-[#1A1D2E] border border-[#334155] rounded-lg p-3 shadow-xl whitespace-nowrap">
                <p className="text-[11px] font-bold text-white mb-1">
                  {new Date(points[hoveredPoint].date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-[14px] font-bold text-[#5A5FF0] mb-1">
                  Score: {Math.round(points[hoveredPoint].score)}%
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
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
        <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between text-[14px]">
            <p className="text-[#64748B]">
              <span className="text-[#1A1D2E] font-semibold">{performance.length}</span> quiz
              {performance.length === 1 ? '' : 'zes'} completed
            </p>
            <p className="text-[#64748B]">
              {trend === 'improving' && (
                <span className="text-[#10B981] font-semibold">
                  📈 Keep up the great work!
                </span>
              )}
              {trend === 'declining' && (
                <span className="text-[#F59E0B] font-semibold">
                  💪 Review your weak topics
                </span>
              )}
              {trend === 'stable' && (
                <span className="text-[#64748B] font-semibold">
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
