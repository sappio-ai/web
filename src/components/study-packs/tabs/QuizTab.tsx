'use client'

import { useState, useEffect } from 'react'
import QuizInterface from '@/components/quiz/QuizInterface'
import QuizHistory from '@/components/quiz/QuizHistory'
import WeakTopics from '@/components/quiz/WeakTopics'
import Orb from '@/components/orb/Orb'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import { Crown } from 'lucide-react'
import type { Quiz } from '@/lib/types/quiz'
import GenerateMoreButton from '@/components/study-packs/GenerateMoreButton'
import UpgradePrompt from '@/components/paywall/UpgradePrompt'
import type { PlanLimits } from '@/lib/types/usage'

interface QuizTabProps {
  packId: string
  userPlan: string
}

export default function QuizTab({ packId, userPlan }: QuizTabProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [weakTopics, setWeakTopics] = useState<string[]>([])
  const [showTopics, setShowTopics] = useState(false)
  const [isLoadingWeakQuiz, setIsLoadingWeakQuiz] = useState(false)
  const [latestWeakTopics, setLatestWeakTopics] = useState<string[]>([])
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [questionCount, setQuestionCount] = useState<number>(0)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [generationStatus, setGenerationStatus] = useState<any>(null)

  useEffect(() => {
    fetchQuiz()
    fetchLimits()
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
        // Use actual quiz items array length for accurate count
        setQuestionCount(data.quiz.items?.length || data.stats?.quizQuestionCount || 0)
        // Get generation status from stats
        setGenerationStatus(data.stats?.generationStatus?.quiz)
      } else {
        setError('No quiz available for this study pack')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLimits = async () => {
    try {
      const limitsUrl = new URL('/api/user/usage', window.location.origin)
      const limitsResponse = await fetch(limitsUrl.toString())
      if (limitsResponse.ok) {
        const limitsData = await limitsResponse.json()
        setLimits(limitsData.limits)
      }
    } catch (error) {
      console.error('Error fetching limits:', error)
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

    // Check if user has access to weak topics feature
    if (userPlan === 'free') {
      setShowPaywall(true)
      return
    }

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
      <div className="relative animate-in fade-in duration-500">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex items-center gap-4 mb-6">
            <Orb pose="processing-thinking" size="md" />
            <div className="flex-1">
              <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-[#F1F5F9] rounded animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-24 bg-[#F1F5F9] rounded-lg animate-pulse" />
            <div className="h-24 bg-[#F1F5F9] rounded-lg animate-pulse" />
          </div>

          <div className="h-12 w-full bg-[#F1F5F9] rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative animate-in fade-in duration-500">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="error-confused" size="lg" />
            <p className="text-[#EF4444] mt-4">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="relative animate-in fade-in duration-500">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="neutral" size="lg" />
            <p className="text-[#64748B] mt-4">No quiz available</p>
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
          userPlan={userPlan}
        />
      </div>
    )
  }

  const canGenerateMore = 
    limits?.batchQuestionsSize !== null && 
    limits?.batchQuestionsSize !== undefined &&
    questionCount < (limits?.questionsPerQuiz || 0)

  // Show quiz overview and history
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Progress Indicator */}
      <div className="text-[14px] text-[#64748B]">
        {!limits ? (
          <span className="inline-block w-24 h-4 bg-[#F1F5F9] rounded animate-pulse" />
        ) : (
          `${questionCount} / ${limits.questionsPerQuiz} questions`
        )}
      </div>
      
      {/* Generate More Button (Paid Users) */}
      {canGenerateMore && limits && (
        <GenerateMoreButton
          contentType="quiz"
          studyPackId={packId}
          currentCount={questionCount}
          maxLimit={limits.questionsPerQuiz}
          batchSize={limits.batchQuestionsSize!}
          userPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
          generationStatus={generationStatus}
          onGenerated={(newCount) => {
            setQuestionCount(newCount)
            setGenerationStatus({ status: 'completed' })
            fetchQuiz() // Refresh quiz to show new questions
          }}
        />
      )}
      
      {/* Upgrade Prompt (Free Users) */}
      {userPlan === 'free' && (
        <UpgradePrompt
          featureName="Generate More Quiz Questions"
          requiredPlan="student_pro"
          benefits={[
            'Generate up to 30 quiz questions per pack',
            'Add +10 questions at a time',
            'Comprehensive topic coverage',
            'Priority processing'
          ]}
          currentPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
        />
      )}
      
      {/* Quiz Overview Card */}
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Orb pose="quiz-master" size="md" />
              <div>
                <h2 className="text-[24px] font-bold text-[#1A1D2E] mb-1">
                  Practice Quiz
                </h2>
                <p className="text-[#64748B] text-[15px]">
                  Test your knowledge with {quiz.items?.length || 0} questions
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
              <p className="text-[#64748B] text-[13px] mb-1">Total Questions</p>
              <p className="text-[#1A1D2E] text-[24px] font-bold">
                {quiz.items?.length || 0}
              </p>
              <p className="text-[#94A3B8] text-[12px] mt-1">
                Multiple choice questions
              </p>
            </div>
            <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
              <p className="text-[#64748B] text-[13px] mb-1">Topics Covered</p>
              <div className="flex items-center gap-2">
                <p className="text-[#1A1D2E] text-[24px] font-bold">
                  {quiz.items
                    ? new Set(
                        quiz.items.map((item) => item.topic || 'General')
                      ).size
                    : 0}
                </p>
                <button
                  onClick={() => setShowTopics(!showTopics)}
                  className="text-[#5A5FF0] hover:text-[#4A4FD0] transition-colors"
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
            <div className="bg-[#F8FAFB] rounded-lg p-4 mb-6 border border-[#E2E8F0]">
              <h4 className="text-[#1A1D2E] font-semibold mb-3 text-[15px]">Quiz Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(quiz.items.map((item) => item.topic || 'General'))
                ).map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-[#5A5FF0]/10 border border-[#5A5FF0]/30 text-[#5A5FF0] rounded-full text-[13px] font-medium"
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
              className="w-full px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[16px] font-semibold rounded-lg transition-colors duration-150 shadow-sm"
            >
              Take Quiz
            </button>

            {/* Retest Weak Topics Button */}
            {latestWeakTopics.length > 0 && (
              <button
                onClick={handleStartWeakTopicQuiz}
                disabled={isLoadingWeakQuiz}
                className={`w-full px-8 py-4 text-white text-[16px] font-semibold rounded-lg transition-colors duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  userPlan === 'free' 
                    ? 'bg-[#94A3B8] hover:bg-[#64748B]' 
                    : 'bg-[#F59E0B] hover:bg-[#D97706]'
                }`}
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
                    {userPlan === 'free' ? (
                      <Crown className="w-5 h-5" />
                    ) : (
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
                    )}
                    <span>
                      {userPlan === 'free' 
                        ? 'Upgrade to Retest Weak Topics' 
                        : `Retest Weak Topics (${latestWeakTopics.length})`}
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

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
      />
    </div>
  )
}

