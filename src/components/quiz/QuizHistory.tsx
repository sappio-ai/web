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
      <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8">
        <p className="text-gray-400 text-center">Loading history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8">
        <p className="text-gray-400 text-center">
          No quiz attempts yet. Take your first quiz!
        </p>
      </div>
    )
  }

  // Calculate trend (improvement over time)
  const scores = results.map((r) => r.score).reverse()
  const hasImprovement =
    scores.length > 1 && scores[scores.length - 1] > scores[0]

  return (
    <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Quiz History</h3>
        {hasImprovement && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
            <svg
              className="w-4 h-4 text-green-400"
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
            <span className="text-green-400 text-sm font-medium">
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
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-gray-400 text-sm">
                  {formatDate(result.taken_at)}
                </p>
                {index === 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-[#a8d5d5]/20 text-[#a8d5d5] text-xs rounded-full">
                    Latest
                  </span>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`text-2xl font-bold ${
                    result.score >= 80
                      ? 'text-green-400'
                      : result.score >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                >
                  {Math.round(result.score)}%
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-sm text-gray-400">
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
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full transition-all ${
                  result.score >= 80
                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                    : result.score >= 60
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                      : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
