'use client'

import { useState, useEffect } from 'react'
import Orb from '@/components/orb/Orb'
import ProgressChart from '@/components/flashcards/ProgressChart'
import StreakDisplay from '@/components/flashcards/StreakDisplay'
import PackCompletenessScore from '@/components/insights/PackCompletenessScore'
import LapseTracking from '@/components/insights/LapseTracking'
import DueLoadForecast from '@/components/insights/DueLoadForecast'
import PerformanceTrends from '@/components/insights/PerformanceTrends'
import SessionDepthAnalytics from '@/components/insights/SessionDepthAnalytics'
import UpgradePrompt from '@/components/paywall/UpgradePrompt'
import DemoPrompt from '@/components/demo/DemoPrompt'
import type { QuizResult, TopicPerformance } from '@/lib/types/quiz'

interface InsightsTabProps {
  packId: string
  userPlan?: string
  isDemo?: boolean
}

export default function InsightsTab({ packId, userPlan, isDemo = false }: InsightsTabProps) {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [packStats, setPackStats] = useState<any>(null)

  useEffect(() => {
    fetchInsights()
  }, [packId])

  const fetchInsights = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch study pack stats
      const packResponse = await fetch(`/api/study-packs/${packId}`)
      if (packResponse.ok) {
        const packData = await packResponse.json()
        setPackStats(packData.stats)

        // Fetch quiz results if quiz exists AND not demo
        if (packData.quiz && !isDemo) {
          const quizResponse = await fetch(
            `/api/quiz-results/history?quiz_id=${packData.quiz.id}&limit=10`
          )
          if (quizResponse.ok) {
            const quizData = await quizResponse.json()
            setQuizResults(quizData.results || [])
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate aggregated topic performance across all quiz attempts
  const getAggregatedTopicPerformance = (): Record<
    string,
    TopicPerformance
  > => {
    const topicMap: Record<
      string,
      { correct: number; total: number; topic: string }
    > = {}

    quizResults.forEach((result) => {
      Object.values(result.detail_json.topicPerformance).forEach((perf) => {
        if (!topicMap[perf.topic]) {
          topicMap[perf.topic] = {
            topic: perf.topic,
            correct: 0,
            total: 0,
          }
        }
        topicMap[perf.topic].correct += perf.correct
        topicMap[perf.topic].total += perf.total
      })
    })

    const aggregated: Record<string, TopicPerformance> = {}
    Object.entries(topicMap).forEach(([topic, data]) => {
      const accuracy = (data.correct / data.total) * 100
      aggregated[topic] = {
        topic: data.topic,
        correct: data.correct,
        total: data.total,
        accuracy,
        isWeak: accuracy < 70,
      }
    })

    return aggregated
  }

  const topicPerformance = getAggregatedTopicPerformance()
  const sortedTopics = Object.values(topicPerformance).sort(
    (a, b) => b.accuracy - a.accuracy
  )

  // Calculate overall quiz performance
  const overallQuizScore =
    quizResults.length > 0
      ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
      : 0

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
            <div className="flex items-center gap-4 mb-6">
              <Orb pose="processing-thinking" size="md" />
              <div className="flex-1">
                <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-[#F1F5F9] rounded animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Progress Chart Skeleton */}
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

        {/* Additional Skeleton Cards */}
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
            <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-[#F1F5F9] rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
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
            <p className="text-[#EF4444] font-semibold mt-4">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Pack Overview Stats - Hide for Demo */}
      {
        !isDemo && (
          <div className="relative">
            <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
            <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
              <div className="flex items-center gap-3 mb-6">
                <Orb pose="analytics-dashboard" size="sm" />
                <h3 className="text-[20px] font-bold text-[#1A1D2E]">Study Pack Stats</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
                  <p className="text-[#64748B] text-[12px] mb-1">Coverage</p>
                  <p className="text-[#1A1D2E] text-[20px] font-bold capitalize">
                    {packStats?.coverage || 'N/A'}
                  </p>
                </div>
                <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
                  <p className="text-[#64748B] text-[12px] mb-1">Flashcards</p>
                  <p className="text-[#1A1D2E] text-[20px] font-bold">
                    {packStats?.cardCount || 0}
                  </p>
                </div>
                <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
                  <p className="text-[#64748B] text-[12px] mb-1">Quiz Attempts</p>
                  <p className="text-[#1A1D2E] text-[20px] font-bold">
                    {quizResults.length}
                  </p>
                </div>
                <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
                  <p className="text-[#64748B] text-[12px] mb-1">Avg Quiz Score</p>
                  <p
                    className={`text-[20px] font-bold ${overallQuizScore >= 70
                      ? 'text-[#10B981]'
                      : overallQuizScore > 0
                        ? 'text-[#F59E0B]'
                        : 'text-[#64748B]'
                      }`}
                  >
                    {quizResults.length > 0
                      ? `${Math.round(overallQuizScore)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Pack Completeness Score - Hide for Demo */}
      {!isDemo && <PackCompletenessScore packId={packId} />}

      {/* Advanced Analytics or Demo Prompt */}
      {isDemo ? (
        <DemoPrompt
          featureName="Deep Learning Insights"
          description="Sign up to get advanced analytics on your study habits, retention rates, and knowledge gaps."
          icon="chart"
          bulletPoints={[
            "Analyze your retention over time",
            "Forecast due cards for efficient studying",
            "Track session depth and focus"
          ]}
        />
      ) : userPlan === 'pro_plus' ? (
        <>
          {/* Due Load Forecast */}
          <DueLoadForecast packId={packId} />

          {/* Lapse Tracking */}
          <LapseTracking packId={packId} />

          {/* Performance Trends */}
          <PerformanceTrends packId={packId} />

          {/* Session Depth Analytics */}
          <SessionDepthAnalytics packId={packId} />
        </>
      ) : (
        <UpgradePrompt
          featureName="Advanced Analytics"
          requiredPlan="pro_plus"
          benefits={[
            'Due load forecasting for better planning',
            'Lapse tracking to identify problem areas',
            'Performance trends over time',
            'Session depth analytics',
            'Detailed retention insights',
          ]}
          currentPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
        />
      )}

      {/* Flashcard Progress - Hide for Demo */}
      {!isDemo && <ProgressChart packId={packId} />}

      {/* Streak - Hide for Demo */}
      {!isDemo && <StreakDisplay />}

      {/* Quiz Performance by Topic */}
      {quizResults.length > 0 && sortedTopics.length > 0 && (
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
            <h3 className="text-[20px] font-bold text-[#1A1D2E] mb-2">
              Quiz Performance by Topic
            </h3>
            <p className="text-[#64748B] text-[14px] mb-6">
              Aggregated across all {quizResults.length} quiz attempt
              {quizResults.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {sortedTopics.map((topic) => (
                <div
                  key={topic.topic}
                  className={`rounded-lg p-4 border transition-all ${topic.isWeak
                    ? 'bg-[#FEF2F2] border-[#FCA5A5] hover:bg-[#FEE2E2]'
                    : 'bg-[#F8FAFB] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1A1D2E] font-semibold text-[14px]">
                        {topic.topic}
                      </span>
                      {topic.isWeak && (
                        <span className="px-2 py-0.5 bg-[#FED7AA] text-[#C2410C] text-[11px] rounded-full font-semibold">
                          Needs work
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-bold text-[14px] ${topic.isWeak ? 'text-[#DC2626]' : 'text-[#10B981]'
                        }`}
                    >
                      {Math.round(topic.accuracy)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ${topic.isWeak
                        ? 'bg-[#DC2626]'
                        : 'bg-gradient-to-r from-[#10B981] to-[#059669]'
                        }`}
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                  <p className="text-[#64748B] text-[12px]">
                    {Math.round(topic.accuracy)}% average across{' '}
                    {quizResults.length} attempt
                    {quizResults.length > 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>

            {/* Tip for weak topics */}
            {sortedTopics.some((t) => t.isWeak) && (
              <div className="mt-6 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4 flex items-center gap-3">
                <Orb pose="weak-area-supportive" size="sm" />
                <p className="text-[#78350F] text-[14px]">
                  <strong className="font-semibold">Tip:</strong> Use &quot;Retest Weak Topics&quot; in the Quiz
                  tab to focus on areas below 70%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Quiz Data - Hide for Demo */}
      {!isDemo && quizResults.length === 0 && (
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
            <div className="flex flex-col items-center justify-center py-12">
              <Orb pose="quiz-master" size="lg" />
              <h3 className="text-[20px] font-bold text-[#1A1D2E] mt-4 mb-2">
                No Quiz Data Yet
              </h3>
              <p className="text-[#64748B] text-center text-[14px] max-w-md">
                Take your first quiz to see detailed performance insights and
                topic analysis here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
