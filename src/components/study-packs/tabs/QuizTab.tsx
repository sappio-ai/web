'use client'

import { useState, useEffect } from 'react'
import QuizInterface from '@/components/quiz/QuizInterface'
import QuizHistory from '@/components/quiz/QuizHistory'
import WeakTopics from '@/components/quiz/WeakTopics'
import Orb from '@/components/orb/Orb'
import type { Quiz } from '@/lib/types/quiz'

interface QuizTabProps {
  packId: string
}

export default function QuizTab({ packId }: QuizTabProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [weakTopics, setWeakTopics] = useState<string[]>([])
  const [showTopics, setShowTopics] = useState(false)
  const [isLoadingWeakQuiz, setIsLoadingWeakQuiz] = useState(false)
  const [latestWeakTopics, setLatestWeakTopics] = useState<string[]>([])
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)

  useEffect(() => {
    fetchQuiz()
  }, [packId])

  useEffect(() => {
    if (quiz) {
      fetchLatestWeakTopics()
    }
  }, [quiz])

  const fetchQuiz = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch study pack to get quiz
      const response = await fetch(`/api/study-packs/${packId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch study pack')
      }

      const data = await response.json()

      if (data.quiz) {
        setQuiz(data.quiz)
      } else {
        setError('No quiz available for this study pack')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLatestWeakTopics = async () => {
    try {
      if (!quiz) return

      const response = await fetch(
        `/api/quiz-results/history?quiz_id=${quiz.id}&limit=1`
      )

      if (!response.ok) return

      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const latestResult = data.results[0]
        const weak = Object.values(
          latestResult.detail_json.topicPerformance
        )
          .filter((t: any) => t.isWeak)
          .map((t: any) => t.topic)

        setLatestWeakTopics(weak)
      }
    } catch (err) {
      console.error('Failed to fetch weak topics:', err)
    }
  }

  const handleStartQuiz = () => {
    setActiveQuiz(quiz)
    setIsQuizActive(true)
  }

  const handleStartWeakTopicQuiz = async () => {
    if (!quiz || latestWeakTopics.length === 0) return

    try {
      setIsLoadingWeakQuiz(true)
      setError(null)

      const response = await fetch(`/api/quizzes/${quiz.id}/weak-topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weakTopics: latestWeakTopics,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate weak topic quiz')
      }

      const data = await response.json()
      setActiveQuiz(data.quiz)
      setIsQuizActive(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoadingWeakQuiz(false)
    }
  }

  const handleExitQuiz = () => {
    setIsQuizActive(false)
    setActiveQuiz(null)
    // Refresh history and weak topics after completing quiz
    fetchQuiz()
    fetchLatestWeakTopics()
  }

  const handleStudyWeakTopics = (topics: string[]) => {
    setWeakTopics(topics)
    // TODO: Navigate to flashcards tab with topic filter
    console.log('Study weak topics:', topics)
  }

  if (isLoading) {
    return (
      <div className="relative group animate-in fade-in duration-500">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Orb pose="processing-thinking" size="md" />
            <div className="flex-1">
              <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
          </div>

          <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative group animate-in fade-in duration-500">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="error-confused" size="lg" />
            <p className="text-red-400 mt-4">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="relative group animate-in fade-in duration-500">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="neutral" size="lg" />
            <p className="text-gray-400 mt-4">No quiz available</p>
          </div>
        </div>
      </div>
    )
  }

  // If quiz is active, show full-screen quiz interface
  if (isQuizActive && activeQuiz) {
    return (
      <div className="animate-in fade-in duration-500">
        <QuizInterface
          quizId={activeQuiz.id}
          quiz={activeQuiz}
          onExit={handleExitQuiz}
        />
      </div>
    )
  }

  // Show quiz overview and history
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quiz Overview Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Orb pose="quiz-master" size="md" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Practice Quiz
                </h2>
                <p className="text-gray-400">
                  Test your knowledge with {quiz.items?.length || 0} questions
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Questions</p>
              <p className="text-white text-2xl font-bold">
                {quiz.items?.length || 0}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Multiple choice questions
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Topics Covered</p>
              <div className="flex items-center gap-2">
                <p className="text-white text-2xl font-bold">
                  {quiz.items
                    ? new Set(
                        quiz.items.map((item) => item.topic || 'General')
                      ).size
                    : 0}
                </p>
                <button
                  onClick={() => setShowTopics(!showTopics)}
                  className="text-[#a8d5d5] hover:text-[#8bc5c5] transition-colors"
                  title="View topics"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Topics List (collapsible) */}
          {showTopics && quiz.items && (
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-3">Quiz Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(quiz.items.map((item) => item.topic || 'General'))
                ).map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-[#a8d5d5]/10 border border-[#a8d5d5]/30 text-[#a8d5d5] rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStartQuiz}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white text-lg font-medium rounded-xl hover:shadow-lg hover:shadow-[#a8d5d5]/30 transition-all hover:scale-105"
            >
              Take Quiz
            </button>

            {/* Retest Weak Topics Button */}
            {latestWeakTopics.length > 0 && (
              <button
                onClick={handleStartWeakTopicQuiz}
                disabled={isLoadingWeakQuiz}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoadingWeakQuiz ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>
                      Retest Weak Topics ({latestWeakTopics.length})
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz History */}
      <QuizHistory quizId={quiz.id} />
    </div>
  )
}

