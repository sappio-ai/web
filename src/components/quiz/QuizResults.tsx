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
        <h2 className="text-[32px] font-bold text-[#1A1D2E] mt-6 mb-2">
          Quiz Complete!
        </h2>
        <div className="text-[56px] font-bold text-[#5A5FF0] mb-2">
          {Math.round(results.score)}%
        </div>
        <p className="text-[#64748B] text-[15px]">
          {correctCount} out of {totalQuestions} correct
        </p>
      </div>

      {/* Stats Card */}
      <div className="relative mb-6">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <h3 className="text-[20px] font-bold text-[#1A1D2E] mb-4">Performance</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
              <p className="text-[#64748B] text-[13px] mb-1">Time Taken</p>
              <p className="text-[#1A1D2E] text-[24px] font-bold">
                {formatDuration(results.duration_s)}
              </p>
            </div>
            <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
              <p className="text-[#64748B] text-[13px] mb-1">Score</p>
              <p className="text-[#1A1D2E] text-[24px] font-bold">
                {Math.round(results.score)}%
              </p>
            </div>
          </div>

          {/* Topic Performance */}
          {Object.keys(results.detail_json.topicPerformance).length > 0 && (
            <div>
              <h4 className="text-[18px] font-bold text-[#1A1D2E] mb-3">
                Performance by Topic
              </h4>
              <div className="space-y-3">
                {Object.values(results.detail_json.topicPerformance).map(
                  (topic) => (
                    <div key={topic.topic} className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E2E8F0]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#1A1D2E] font-medium text-[15px]">
                          {topic.topic}
                        </span>
                        <span
                          className={`font-bold text-[16px] ${topic.isWeak ? 'text-[#EF4444]' : 'text-[#10B981]'
                            }`}
                        >
                          {Math.round(topic.accuracy)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${topic.isWeak
                              ? 'bg-[#EF4444]'
                              : 'bg-[#5A5FF0]'
                            }`}
                          style={{ width: `${topic.accuracy}%` }}
                        />
                      </div>
                      <p className="text-[#64748B] text-[13px] mt-1">
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
      </div>

      {/* Weak Topics Alert */}
      {Object.values(results.detail_json.topicPerformance).some(
        (t) => t.isWeak
      ) && (
          <div className="relative mb-6">
            <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#F59E0B]/40" />
            <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#F59E0B]/50">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-[#F59E0B] flex-shrink-0 mt-1"
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
                  <h4 className="text-[#F59E0B] font-bold mb-1 text-[16px]">
                    Weak Topics Identified
                  </h4>
                  <p className="text-[#64748B] text-[14px]">
                    You scored below 70% on some topics. Consider reviewing
                    flashcards for these areas to improve your understanding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {onRetake && (
          <button
            onClick={onRetake}
            className="w-full px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 shadow-sm"
          >
            Retake Quiz
          </button>
        )}
        {onExit && (
          <button
            onClick={onExit}
            className="w-full px-6 py-3 bg-white border border-[#CBD5E1] text-[#1A1D2E] text-[15px] font-semibold rounded-lg hover:bg-[#F1F5F9] transition-colors duration-150"
          >
            Back to Quiz Tab
          </button>
        )}
      </div>
    </div>
  )
}
