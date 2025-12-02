'use client'

import type { QuizResult } from '@/lib/types/quiz'
import Orb from '../orb/Orb'

interface QuizResultsProps {
  results: QuizResult
  quizId: string
  onExit?: () => void
  onRetake?: () => void
}

export default function QuizResults({
  results,
  quizId,
  onExit,
  onRetake,
}: QuizResultsProps) {
  const isHighScore = results.score >= 80
  const correctCount = results.detail_json.answers.filter(
    (a) => a.isCorrect
  ).length
  const totalQuestions = results.detail_json.answers.length

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Orb and Score */}
      <div className="flex flex-col items-center mb-8">
        <Orb
          pose={isHighScore ? 'success-celebrating' : 'neutral'}
          size="lg"
        />
        <h2 className="text-3xl font-bold text-white mt-6 mb-2">
          Quiz Complete!
        </h2>
        <div className="text-6xl font-bold text-[#a8d5d5] mb-2">
          {Math.round(results.score)}%
        </div>
        <p className="text-gray-300">
          {correctCount} out of {totalQuestions} correct
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Performance</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Time Taken</p>
            <p className="text-white text-2xl font-bold">
              {formatDuration(results.duration_s)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Score</p>
            <p className="text-white text-2xl font-bold">
              {Math.round(results.score)}%
            </p>
          </div>
        </div>

        {/* Topic Performance */}
        {Object.keys(results.detail_json.topicPerformance).length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-white mb-3">
              Performance by Topic
            </h4>
            <div className="space-y-3">
              {Object.values(results.detail_json.topicPerformance).map(
                (topic) => (
                  <div key={topic.topic} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">
                        {topic.topic}
                      </span>
                      <span
                        className={`font-bold ${
                          topic.isWeak ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {Math.round(topic.accuracy)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          topic.isWeak
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5]'
                        }`}
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {topic.correct} / {topic.total} correct
                      {topic.isWeak && ' - Needs improvement'}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weak Topics Alert */}
      {Object.values(results.detail_json.topicPerformance).some(
        (t) => t.isWeak
      ) && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="text-orange-400 font-bold mb-1">
                Weak Topics Identified
              </h4>
              <p className="text-gray-300 text-sm">
                You scored below 70% on some topics. Consider reviewing
                flashcards for these areas to improve your understanding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {onRetake && (
          <button
            onClick={onRetake}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#a8d5d5]/30 transition-all hover:scale-105"
          >
            Retake Quiz
          </button>
        )}
        {onExit && (
          <button
            onClick={onExit}
            className="w-full px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
          >
            Back to Quiz Tab
          </button>
        )}
      </div>
    </div>
  )
}
