'use client'

import { useFlashcardSession } from '@/lib/hooks/useFlashcardSession'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import FlashcardCard from './FlashcardCard'
import GradingButtons from './GradingButtons'
import SessionStats from './SessionStats'
import BreakSuggestion from './BreakSuggestion'
import BreakTimer from './BreakTimer'
import Orb from '../orb/Orb'

interface FlashcardReviewProps {
  packId: string
  topicFilter?: string
  onComplete?: () => void
  isDemo?: boolean
}

export default function FlashcardReview({
  packId,
  topicFilter,
  onComplete,
  isDemo = false,
}: FlashcardReviewProps) {
  const {
    currentCard,
    isFlipped,
    progress,
    sessionStats,
    isComplete,
    isLoading,
    error,
    showBreakSuggestion,
    isOnBreak,
    breakTimeRemaining,
    isProcessing,
    flip,
    grade,
    startSession,
    takeBreak,
    continueStudying,
    disableBreakSuggestions,
  } = useFlashcardSession(packId, topicFilter, isDemo)

  // Keyboard shortcut for flipping
  useKeyboardShortcuts({
    ' ': flip, // Space key
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="mb-6">
          <Orb pose="processing-thinking" size="lg" />
        </div>
        <p className="text-[#64748B] mb-8">Loading flashcards...</p>

        {/* Loading Skeleton */}
        <div className="w-full max-w-2xl h-64 sm:h-80 md:h-96 bg-[#F1F5F9] rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-[#F1F5F9] rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Orb pose="error-confused" size="lg" />
        <p className="text-[#EF4444] mt-4">{error}</p>
        <button
          onClick={startSession}
          className="mt-4 px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white rounded-lg shadow-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show break timer if on break
  if (isOnBreak) {
    return <BreakTimer timeRemaining={breakTimeRemaining} />
  }

  if (isComplete) {
    return (
      <SessionStats
        stats={sessionStats}
        onRestart={startSession}
        onExit={onComplete}
        topicFilter={topicFilter}
      />
    )
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Orb pose="neutral" size="lg" />
        <p className="text-[#64748B] mt-4">No cards due for review!</p>
      </div>
    )
  }

  return (
    <>
      {/* Break Suggestion Modal */}
      {showBreakSuggestion && (
        <BreakSuggestion
          onTakeBreak={takeBreak}
          onContinue={continueStudying}
          onDisable={disableBreakSuggestions}
        />
      )}

      <div className="flex flex-col items-center max-w-4xl mx-auto">
        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {currentCard && (
            <span>
              Card {progress.current} of {progress.total}.{' '}
              {isFlipped ? 'Answer revealed' : 'Question shown'}
            </span>
          )}
        </div>

        {/* Topic Badge */}
        {topicFilter && (
          <div className="mb-4 px-6 py-2 bg-[#EEF2FF] border border-[#5A5FF0]/30 rounded-full">
            <p className="text-[#5A5FF0] font-medium text-[14px]">
              Studying: {topicFilter}
            </p>
          </div>
        )}

        {/* Orb Avatar */}
        <div className="mb-6">
          <Orb pose="flashcard-holding" size="lg" />
        </div>

        {/* Progress Indicator */}
        <div className="text-center mb-6">
          <p className="text-[#64748B] text-[18px]">
            Card {progress.current} of {progress.total}
          </p>
        </div>

        {/* Flashcard */}
        <FlashcardCard card={currentCard} isFlipped={isFlipped} onFlip={flip} />

        {/* Action Buttons */}
        {!isFlipped ? (
          <button
            onClick={flip}
            disabled={isProcessing}
            className="mt-8 px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[16px] font-semibold rounded-xl shadow-sm transition-colors hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Show Answer (Space)
          </button>
        ) : (
          <GradingButtons onGrade={grade} disabled={isProcessing} />
        )}
      </div>
    </>
  )
}
