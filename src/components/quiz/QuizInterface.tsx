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
          <p className="text-gray-400 mt-4">Loading quiz...</p>
        </div>

        {/* Loading Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
          <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="w-full h-96 bg-white/5 rounded-2xl animate-pulse mb-6" />
        <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Orb pose="error-confused" size="lg" />
        <p className="text-red-400 mt-4">{error}</p>
        {onExit && (
          <button
            onClick={onExit}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white rounded-lg hover:shadow-lg transition-all"
          >
            Back to Quiz Tab
          </button>
        )}
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
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Orb pose="neutral" size="lg" />
        <p className="text-gray-400 mt-4">No questions available</p>
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
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Orb pose="teacher-pointer" size="sm" />
            <div>
              <h3 className="text-white font-bold">Weak Topic Review</h3>
              <p className="text-gray-300 text-sm">
                Focus on improving your understanding of:{' '}
                {providedQuiz?.weakTopics?.join(', ')}
              </p>
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
          <p className="text-gray-400 text-lg">
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
          className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white text-lg font-medium rounded-xl hover:shadow-lg hover:shadow-[#a8d5d5]/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
