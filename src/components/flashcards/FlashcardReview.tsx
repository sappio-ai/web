'use client'

import { useState, useEffect, useCallback } from 'react'
import { useFlashcardSession } from '@/lib/hooks/useFlashcardSession'
import type { XPEvent } from '@/lib/hooks/useFlashcardSession'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import FlashcardCard from './FlashcardCard'
import GradingButtons from './GradingButtons'
import SessionStats from './SessionStats'
import BreakSuggestion from './BreakSuggestion'
import BreakTimer from './BreakTimer'
import Orb from '../orb/Orb'
import FirstReviewTutorial from './FirstReviewTutorial'
import FirstSessionComplete from './FirstSessionComplete'
import SessionXPBar from '../gamification/SessionXPBar'
import XPFloatingAnimation from '../gamification/XPFloatingAnimation'
import LevelUpToast from '../gamification/LevelUpToast'
import DailyGoalCelebration from '../gamification/DailyGoalCelebration'

interface ToastData {
  id: string
  type: 'level' | 'badge'
  level: number
  badgeName?: string
  badgeIcon?: string
  badgeColor?: string
}

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
    sessionXp,
    currentLevel,
    dailyXp,
    dailyGoal,
    xpEvents,
    flip,
    grade,
    startSession,
    takeBreak,
    continueStudying,
    disableBreakSuggestions,
  } = useFlashcardSession(packId, topicFilter, isDemo)

  // Toast queue for level-ups and badges
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [showDailyGoal, setShowDailyGoal] = useState(false)
  const [latestXpEvent, setLatestXpEvent] = useState<XPEvent | null>(null)

  // Watch for XP events to trigger toasts and animations
  useEffect(() => {
    if (xpEvents.length === 0) return
    const latest = xpEvents[xpEvents.length - 1]
    setLatestXpEvent(latest)

    if (latest.leveledUp) {
      setToasts(prev => [...prev, {
        id: `level-${latest.id}`,
        type: 'level',
        level: latest.level,
      }])
    }

    for (const badge of latest.newBadges) {
      setToasts(prev => [...prev, {
        id: `badge-${badge.id}-${latest.id}`,
        type: 'badge',
        level: latest.level,
        badgeName: badge.name,
        badgeIcon: badge.icon,
        badgeColor: badge.color,
      }])
    }

    if (latest.dailyGoalMet) {
      setShowDailyGoal(true)
    }
  }, [xpEvents])

  const dismissToast = useCallback(() => {
    setToasts(prev => prev.slice(1))
  }, [])

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
      <>
        <FirstSessionComplete
          stats={sessionStats}
          onContinue={onComplete || (() => {})}
          onRestart={startSession}
        />
        <SessionStats
          stats={sessionStats}
          sessionXp={sessionXp}
          onRestart={startSession}
          onExit={onComplete}
          topicFilter={topicFilter}
        />
      </>
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
      {/* First-time SRS tutorial */}
      <FirstReviewTutorial />

      {/* Break Suggestion Modal */}
      {showBreakSuggestion && (
        <BreakSuggestion
          onTakeBreak={takeBreak}
          onContinue={continueStudying}
          onDisable={disableBreakSuggestions}
        />
      )}

      {/* Toasts */}
      {toasts.length > 0 && (
        <LevelUpToast
          level={toasts[0].level}
          badgeName={toasts[0].badgeName}
          badgeIcon={toasts[0].badgeIcon}
          badgeColor={toasts[0].badgeColor}
          onClose={dismissToast}
        />
      )}

      {/* Daily Goal Celebration */}
      {showDailyGoal && (
        <DailyGoalCelebration onDone={() => setShowDailyGoal(false)} />
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

        {/* XP Session Bar */}
        {!isDemo && sessionStats.cardsReviewed > 0 && (
          <div className="w-full max-w-2xl mb-4">
            <SessionXPBar
              sessionXp={sessionXp}
              dailyXp={dailyXp}
              dailyGoal={dailyGoal}
              level={currentLevel}
              dailyGoalJustMet={latestXpEvent?.dailyGoalMet}
            />
          </div>
        )}

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
        <div className="relative">
          {/* XP Float Animation */}
          {latestXpEvent && (
            <XPFloatingAnimation key={latestXpEvent.id} amount={latestXpEvent.amount} />
          )}

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
      </div>
    </>
  )
}
