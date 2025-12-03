'use client'

import { useQuizSession } from '@/lib/hooks/useQuizSession'
import ModeSelector from './ModeSelector'
import TimerDisplay from './TimerDisplay'
import QuestionCard from './QuestionCard'
import QuizResults from './QuizResults'
import Orb from '../orb/Orb'

interface QuizInterfaceProps {
  quizId: string
  quiz?: any
  onExit?: () => void
}

export default function QuizInterface({
  quizId,
  quiz: providedQuiz,
  onExit,
}: QuizInterfaceProps) {
  const {
    mode,
    currentQuestion,
    userAnswer,
    isAnswered,
    feedback,
    progress,
    timeRemaining,
    isComplete,
    results,
    isLoading,
    error,
    isSubmitting,
    selectMode,
    submitAnswer,
    nextQuestion,
    restartQuiz,
  } = useQuizSession(quizId, providedQuiz)

  const isWeakTopicQuiz = providedQuiz?.isWeakTopicQuiz || false

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <Orb pose="processing-thinking" size="lg" />
          <p className="text-[#64748B] mt-4">Loading quiz...</p>
        </div>

        {/* Loading Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse" />
          <div className="h-8 w-24 bg-[#F1F5F9] rounded animate-pulse" />
        </div>
        <div className="w-full h-96 bg-[#F1F5F9] rounded-2xl animate-pulse mb-6" />
        <div className="w-full h-12 bg-[#F1F5F9] rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <Orb pose="error-confused" size="lg" />
            <p className="text-[#EF4444] mt-4">{error}</p>
            {onExit && (
              <button
                onClick={onExit}
                className="mt-4 px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 shadow-sm"
              >
                Back to Quiz Tab
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!mode) {
    return <ModeSelector onSelectMode={selectMode} />
  }

  if (isComplete && results) {
    return <QuizResults results={results} quizId={quizId} onExit={onExit} onRetake={restartQuiz} />
  }

  if (!currentQuestion) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <Orb pose="neutral" size="lg" />
            <p className="text-[#64748B] mt-4">No questions available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentQuestion && (
          <span>
            Question {progress.current} of {progress.total}.{' '}
            {isAnswered ? 'Answer submitted' : 'Question displayed'}
          </span>
        )}
      </div>

      {/* Weak Topic Quiz Banner */}
      {isWeakTopicQuiz && (
        <div className="relative mb-6">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#F59E0B]/40" />
          <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#F59E0B]/50">
            <div className="flex items-center gap-3">
              <Orb pose="teacher-pointer" size="sm" />
              <div>
                <h3 className="text-[#1A1D2E] font-bold text-[16px]">Weak Topic Review</h3>
                <p className="text-[#64748B] text-[14px]">
                  Focus on improving your understanding of:{' '}
                  <span className="text-[#F59E0B] font-medium">{providedQuiz?.weakTopics?.join(', ')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <Orb
            pose={isWeakTopicQuiz ? 'teacher-pointer' : 'quiz-master'}
            size="sm"
          />
          <p className="text-[#64748B] text-[16px] font-medium">
            Question {progress.current} of {progress.total}
          </p>
        </div>

        {/* Timer (Timed Mode Only) */}
        {mode === 'timed' && timeRemaining !== null && (
          <TimerDisplay timeRemaining={timeRemaining} />
        )}
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        userAnswer={userAnswer}
        isAnswered={isAnswered}
        feedback={feedback}
        onSubmit={submitAnswer}
      />

      {/* Next Button */}
      {isAnswered && (
        <button
          onClick={nextQuestion}
          disabled={isSubmitting}
          className="mt-6 w-full px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[16px] font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
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
              <span>Submitting...</span>
            </>
          ) : (
            <span>
              {progress.current < progress.total
                ? 'Next Question'
                : 'Finish Quiz'}
            </span>
          )}
        </button>
      )}
    </div>
  )
}
