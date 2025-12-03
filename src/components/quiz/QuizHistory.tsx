'use client'

import { useState, useEffect } from 'react'
import type { QuizResult } from '@/lib/types/quiz'

interface QuizHistoryProps {
  quizId?: string
}

export default function QuizHistory({ quizId }: QuizHistoryProps) {
  const [results, setResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [quizId])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = new URL('/api/quiz-results/history', window.location.origin)
      if (quizId) {
        url.searchParams.set('quiz_id', quizId)
      }
      url.searchParams.set('limit', '5')

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error('Failed to fetch quiz history')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <p className="text-[#64748B] text-center">Loading history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <p className="text-[#EF4444] text-center">{error}</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <p className="text-[#64748B] text-center">
            No quiz attempts yet. Take your first quiz!
          </p>
        </div>
      </div>
    )
  }

  // Calculate trend (improvement over time)
  const scores = results.map((r) => r.score).reverse()
  const hasImprovement =
    scores.length > 1 && scores[scores.length - 1] > scores[0]

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[24px] font-bold text-[#1A1D2E]">Quiz History</h3>
          {hasImprovement && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full">
              <svg
                className="w-4 h-4 text-[#10B981]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-[#10B981] text-[13px] font-semibold">
                Improving!
              </span>
            </div>
          )}
        </div>

        {/* Attempts List */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={result.id}
              className="bg-[#F8FAFB] rounded-lg p-4 hover:bg-[#F1F5F9] transition-all border border-[#E2E8F0]"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[#64748B] text-[13px]">
                    {formatDate(result.taken_at)}
                  </p>
                  {index === 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#5A5FF0]/10 text-[#5A5FF0] text-[11px] font-semibold rounded-full">
                      Latest
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`text-[24px] font-bold ${
                      result.score >= 80
                        ? 'text-[#10B981]'
                        : result.score >= 60
                          ? 'text-[#F59E0B]'
                          : 'text-[#EF4444]'
                    }`}
                  >
                    {Math.round(result.score)}%
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-[13px] text-[#64748B]">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{formatDuration(result.duration_s)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    {result.detail_json.answers.filter((a) => a.isCorrect).length}{' '}
                    / {result.detail_json.answers.length} correct
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all ${
                    result.score >= 80
                      ? 'bg-[#10B981]'
                      : result.score >= 60
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#EF4444]'
                  }`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
