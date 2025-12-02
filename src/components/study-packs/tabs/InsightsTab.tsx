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
import type { QuizResult, TopicPerformance } from '@/lib/types/quiz'

interface InsightsTabProps {
  packId: string
}

export default function InsightsTab({ packId }: InsightsTabProps) {
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

        // Fetch quiz results if quiz exists
        if (packData.quiz) {
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
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
          <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <Orb pose="processing-thinking" size="md" />
              <div className="flex-1">
                <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-white/5 rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Chart Skeleton */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
          <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-6" />
            <div className="h-8 w-full bg-white/5 rounded-lg animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-white/5 rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Additional Skeleton Cards */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
          <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white/5 rounded-lg animate-pulse"
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Pack Overview Stats */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Orb pose="analytics-dashboard" size="sm" />
            <h3 className="text-xl font-bold text-white">Study Pack Stats</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <p className="text-gray-400 text-xs mb-1">Coverage</p>
              <p className="text-white text-xl font-bold capitalize">
                {packStats?.coverage || 'N/A'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <p className="text-gray-400 text-xs mb-1">Flashcards</p>
              <p className="text-white text-xl font-bold">
                {packStats?.cardCount || 0}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <p className="text-gray-400 text-xs mb-1">Quiz Attempts</p>
              <p className="text-white text-xl font-bold">
                {quizResults.length}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <p className="text-gray-400 text-xs mb-1">Avg Quiz Score</p>
              <p
                className={`text-xl font-bold ${
                  overallQuizScore >= 70
                    ? 'text-green-400'
                    : overallQuizScore > 0
                      ? 'text-orange-400'
                      : 'text-gray-400'
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

      {/* Pack Completeness Score */}
      <PackCompletenessScore packId={packId} />

      {/* Due Load Forecast */}
      <DueLoadForecast packId={packId} />

      {/* Lapse Tracking */}
      <LapseTracking packId={packId} />

      {/* Performance Trends */}
      <PerformanceTrends packId={packId} />

      {/* Session Depth Analytics */}
      <SessionDepthAnalytics packId={packId} />

      {/* Flashcard Progress */}
      <ProgressChart packId={packId} />

      {/* Streak */}
      <StreakDisplay />

      {/* Quiz Performance by Topic */}
      {quizResults.length > 0 && sortedTopics.length > 0 && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
          <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">
              Quiz Performance by Topic
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Aggregated across all {quizResults.length} quiz attempt
              {quizResults.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {sortedTopics.map((topic) => (
                <div
                  key={topic.topic}
                  className={`rounded-lg p-4 border transition-all ${
                    topic.isWeak
                      ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">
                        {topic.topic}
                      </span>
                      {topic.isWeak && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                          Needs work
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        topic.isWeak ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {Math.round(topic.accuracy)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ${
                        topic.isWeak
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5]'
                      }`}
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs">
                    {Math.round(topic.accuracy)}% average across{' '}
                    {quizResults.length} attempt
                    {quizResults.length > 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>

            {/* Tip for weak topics */}
            {sortedTopics.some((t) => t.isWeak) && (
              <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-center gap-3">
                <Orb pose="weak-area-supportive" size="sm" />
                <p className="text-gray-300 text-sm">
                  <strong>Tip:</strong> Use &quot;Retest Weak Topics&quot; in the Quiz
                  tab to focus on areas below 70%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Quiz Data */}
      {quizResults.length === 0 && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
          <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Orb pose="quiz-master" size="lg" />
              <h3 className="text-xl font-bold text-white mt-4 mb-2">
                No Quiz Data Yet
              </h3>
              <p className="text-gray-400 text-center text-sm max-w-md">
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
