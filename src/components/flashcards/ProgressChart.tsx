'use client'

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import type { CardProgress } from '@/lib/types/flashcards'

interface ProgressChartProps {
  packId: string
}

export default function ProgressChart({ packId }: ProgressChartProps) {
  const [progress, setProgress] = useState<CardProgress | null>(null)
  const [totalCards, setTotalCards] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/flashcards/stats?packId=${packId}`
        )
        if (response.ok) {
          const data = await response.json()
          setProgress(data.progress)
          setTotalCards(data.totalCards)
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [packId])

  if (isLoading || !progress) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-6" />
          <div className="h-8 w-full bg-[#F1F5F9] rounded-lg animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-[#F1F5F9] rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const categories = [
    {
      key: 'new',
      label: 'New',
      color: 'bg-[#64748B]',
      count: progress.new,
      description: 'Never reviewed (0 reps)',
    },
    {
      key: 'learning',
      label: 'Learning',
      color: 'bg-[#F59E0B]',
      count: progress.learning,
      description: 'In progress (1-4 reps)',
    },
    {
      key: 'review',
      label: 'Review',
      color: 'bg-[#5A5FF0]',
      count: progress.review,
      description: 'Regular review (5+ reps, <30 days)',
    },
    {
      key: 'mastered',
      label: 'Mastered',
      color: 'bg-[#10B981]',
      count: progress.mastered,
      description: 'Long-term memory (30+ days)',
    },
  ]

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#5A5FF0]" strokeWidth={2} />
          <h3 className="text-[20px] font-bold text-[#1A1D2E]">Learning Progress</h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex h-8 rounded-lg overflow-hidden bg-[#F1F5F9]">
            {categories.map((category) => {
              const percentage =
                totalCards > 0 ? (category.count / totalCards) * 100 : 0
              if (percentage === 0) return null
              return (
                <div
                  key={category.key}
                  className={`${category.color} transition-all hover:opacity-80 cursor-pointer relative group/bar`}
                  style={{ width: `${percentage}%` }}
                  title={`${category.label}: ${category.count} cards (${percentage.toFixed(1)}%)`}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                    <span className="text-[12px] font-bold text-white">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => {
              const percentage =
                totalCards > 0
                  ? ((category.count / totalCards) * 100).toFixed(1)
                  : '0'
              return (
                <div
                  key={category.key}
                  className="bg-[#F8FAFB] rounded-lg p-3 hover:bg-[#F1F5F9] transition-all border border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-3 h-3 rounded ${category.color}`} />
                    <p className="text-[14px] font-bold text-[#1A1D2E]">
                      {category.label}
                    </p>
                  </div>
                  <p className="text-[12px] text-[#64748B] ml-6">
                    {category.description}
                  </p>
                  <p className="text-[12px] text-[#94A3B8] ml-6 mt-1">
                    {category.count} cards ({percentage}%)
                  </p>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <p className="text-[14px] text-[#64748B]">
              Total Cards:{' '}
              <span className="text-[#1A1D2E] font-bold">{totalCards}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
