// Custom hook for managing flashcard review sessions

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Flashcard, SessionStats, Grade } from '@/lib/types/flashcards'
import { AnalyticsService } from '@/lib/services/AnalyticsService'

export interface XPEvent {
  id: string
  amount: number
  leveledUp: boolean
  dailyGoalMet: boolean
  newBadges: Array<{ id: string; name: string; icon: string; color: string }>
  level: number
}

interface UseFlashcardSessionReturn {
  currentCard: Flashcard | null
  isFlipped: boolean
  progress: { current: number; total: number }
  sessionStats: SessionStats
  isComplete: boolean
  isLoading: boolean
  error: string | null
  showBreakSuggestion: boolean
  isOnBreak: boolean
  breakTimeRemaining: number
  isProcessing: boolean
  sessionXp: number
  currentLevel: number
  dailyXp: number
  dailyGoal: number
  xpEvents: XPEvent[]
  flip: () => void
  grade: (grade: Grade) => Promise<void>
  startSession: () => Promise<void>
  takeBreak: () => void
  continueStudying: () => void
  disableBreakSuggestions: () => void
}

export function useFlashcardSession(
  packId: string,
  topicFilter?: string,
  isDemo: boolean = false
): UseFlashcardSessionReturn {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [prefetchedCards, setPrefetchedCards] = useState<Set<number>>(
    new Set()
  )
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    cardsReviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    accuracy: 0,
    averageTime: 0,
    totalTime: 0,
  })
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now())
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0)
  const [breakSuggestionsDisabled, setBreakSuggestionsDisabled] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [dailyXp, setDailyXp] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(100)
  const [xpEvents, setXpEvents] = useState<XPEvent[]>([])
  const onboardingTriggeredRef = useRef(false)

  // Fetch due cards
  const fetchDueCards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = new URL(
        `/api/study-packs/${packId}/flashcards/due`,
        window.location.origin
      )
      if (topicFilter) {
        url.searchParams.set('topic', topicFilter)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error('Failed to fetch due cards')
      }

      const data = await response.json()
      setCards(data.cards || [])

      if (data.cards.length === 0) {
        setIsComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [packId, topicFilter])

  // Create session record in database
  const createSessionRecord = useCallback(async () => {
    if (isDemo) return 'demo-session-id'
    try {
      const response = await fetch('/api/review-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          study_pack_id: packId,
          topic_filter: topicFilter || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSessionId(data.sessionId)
        return data.sessionId
      }
    } catch (err) {
      console.error('Failed to create session record:', err)
    }
    return null
  }, [packId, topicFilter])

  // Update session record in database
  const updateSessionRecord = useCallback(async (sessionId: string, stats: SessionStats) => {
    if (isDemo) return
    try {
      await fetch(`/api/review-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards_reviewed: stats.cardsReviewed,
          accuracy: stats.accuracy,
        }),
      })
    } catch (err) {
      console.error('Failed to update session record:', err)
    }
  }, [])

  // Start session (for "Review Again" button)
  const startSession = useCallback(async () => {
    // Reset stats when starting a new session
    setSessionStats({
      cardsReviewed: 0,
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
      accuracy: 0,
      averageTime: 0,
      totalTime: 0,
    })

    setSessionXp(0)
    setXpEvents([])

    await fetchDueCards()
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsComplete(false)
    setCardStartTime(Date.now())

    // Always create a new session when explicitly restarting
    const sessionId = await createSessionRecord()
    setCurrentSessionId(sessionId)
  }, [fetchDueCards, createSessionRecord])

  // Initialize session on mount
  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      if (!mounted) return

      await fetchDueCards()

      if (!mounted) return

      setCardStartTime(Date.now())

      // Create initial session record only once
      if (!currentSessionId) {
        const sessionId = await createSessionRecord()
        if (mounted) {
          setCurrentSessionId(sessionId)
        }
      }
    }

    initSession()

    return () => {
      mounted = false
    }
  }, []) // Empty deps - only run once on mount

  // Check for break suggestion after 20 cards
  useEffect(() => {
    if (
      !breakSuggestionsDisabled &&
      sessionStats.cardsReviewed >= 20 &&
      sessionStats.cardsReviewed % 20 === 0 &&
      !showBreakSuggestion &&
      !isOnBreak
    ) {
      setShowBreakSuggestion(true)
    }
  }, [sessionStats.cardsReviewed, breakSuggestionsDisabled, showBreakSuggestion, isOnBreak])

  // Break timer countdown
  useEffect(() => {
    if (isOnBreak && breakTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBreakTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsOnBreak(false)
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Break Complete!', {
                body: 'Time to resume studying!',
                icon: '/orb/neutral.svg',
              })
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isOnBreak, breakTimeRemaining])

  // Flip card
  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  // Grade card and move to next
  const grade = useCallback(
    async (gradeValue: Grade) => {
      if (!cards[currentIndex]) return

      // Prevent multiple rapid inputs
      if (isProcessing) return
      setIsProcessing(true)

      try {
        const cardTime = Date.now() - cardStartTime

        // Update session stats
        setSessionStats((prev) => {
          const newStats = {
            ...prev,
            cardsReviewed: prev.cardsReviewed + 1,
            [gradeValue]: prev[gradeValue] + 1,
            totalTime: prev.totalTime + cardTime,
          }

          // Calculate accuracy (good + easy) / total
          const goodAndEasy = newStats.good + newStats.easy
          newStats.accuracy =
            newStats.cardsReviewed > 0
              ? (goodAndEasy / newStats.cardsReviewed) * 100
              : 0

          // Calculate average time
          newStats.averageTime =
            newStats.cardsReviewed > 0
              ? newStats.totalTime / newStats.cardsReviewed
              : 0

          return newStats
        })

        // Trigger onboarding completion after 5 cards reviewed
        if (!isDemo && !onboardingTriggeredRef.current && sessionStats.cardsReviewed + 1 >= 5) {
          onboardingTriggeredRef.current = true
          fetch('/api/user/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reviewed_flashcards' }),
          }).catch(() => {})
        }

        // Submit review to API with retry logic
        if (isDemo) {
          // In demo mode, just simulate success delay
          await new Promise(resolve => setTimeout(resolve, 300))
        } else {
          let retries = 3
          let lastError: Error | null = null

          while (retries > 0) {
            try {
              const response = await fetch(
                `/api/flashcards/${cards[currentIndex].id}/review`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ grade: gradeValue }),
                }
              )

              if (!response.ok) {
                throw new Error('Failed to submit review')
              }

              // Parse XP data from response
              try {
                const data = await response.json()
                if (data.xp) {
                  setSessionXp(prev => prev + data.xp.awarded)
                  setCurrentLevel(data.xp.level)
                  setDailyXp(data.xp.dailyXp)
                  setDailyGoal(data.xp.dailyGoal)
                  setXpEvents(prev => [...prev, {
                    id: `${Date.now()}-${currentIndex}`,
                    amount: data.xp.awarded,
                    leveledUp: data.xp.leveledUp,
                    dailyGoalMet: data.xp.dailyGoalMet,
                    newBadges: data.xp.newBadges || [],
                    level: data.xp.level,
                  }])
                }
              } catch {}

              // Success - break out of retry loop
              break
            } catch (err) {
              lastError = err instanceof Error ? err : new Error('Unknown error')
              retries--

              if (retries === 0) {
                // All retries failed - but don't block user, just log
                console.error('Failed to submit review after retries:', lastError)
                // Continue anyway - optimistic update already happened
              } else {
                // Wait before retry (exponential backoff)
                await new Promise((resolve) =>
                  setTimeout(resolve, (4 - retries) * 1000)
                )
              }
            }
          }
        }

        // Move to next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setIsFlipped(false)
          setCardStartTime(Date.now())

          // Prefetch next 3 cards (images/data)
          prefetchNextCards(currentIndex + 1)
        } else {
          // Session complete
          setIsComplete(true)

          // Update session record with final stats
          if (currentSessionId) {
            const finalStats = {
              ...sessionStats,
              cardsReviewed: sessionStats.cardsReviewed + 1,
              [gradeValue]: sessionStats[gradeValue] + 1,
            }
            const goodAndEasy = finalStats.good + finalStats.easy
            finalStats.accuracy = finalStats.cardsReviewed > 0
              ? (goodAndEasy / finalStats.cardsReviewed) * 100
              : 0

            updateSessionRecord(currentSessionId, finalStats)

            // Track review completed event
            if (!isDemo) {
              AnalyticsService.trackReviewCompleted(
                packId,
                finalStats.cardsReviewed,
                Math.round(finalStats.accuracy)
              )
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to grade card')
      } finally {
        // Re-enable input after a short delay to prevent accidental double-clicks
        setTimeout(() => {
          setIsProcessing(false)
        }, 300)
      }
    },
    [cards, currentIndex, cardStartTime, isProcessing, currentSessionId, sessionStats, updateSessionRecord, isDemo]
  )

  // Prefetch next 3 cards
  const prefetchNextCards = useCallback(
    (fromIndex: number) => {
      for (let i = fromIndex; i < Math.min(fromIndex + 3, cards.length); i++) {
        if (!prefetchedCards.has(i) && cards[i]) {
          setPrefetchedCards((prev) => new Set(prev).add(i))
          // Prefetch happens automatically when we access the card data
          // This just marks them as "accessed" for tracking
        }
      }
    },
    [cards, prefetchedCards]
  )

  // Take a break
  const takeBreak = useCallback(() => {
    setShowBreakSuggestion(false)
    setIsOnBreak(true)
    setBreakTimeRemaining(300) // 5 minutes in seconds
  }, [])

  // Continue studying without break
  const continueStudying = useCallback(() => {
    setShowBreakSuggestion(false)
  }, [])

  // Disable break suggestions
  const disableBreakSuggestions = useCallback(() => {
    setBreakSuggestionsDisabled(true)
    setShowBreakSuggestion(false)
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('breakSuggestionsDisabled', 'true')
    }
  }, [])

  // Load break preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const disabled = localStorage.getItem('breakSuggestionsDisabled') === 'true'
      setBreakSuggestionsDisabled(disabled)
    }
  }, [])

  const currentCard = cards[currentIndex] || null

  return {
    currentCard,
    isFlipped,
    progress: {
      current: currentIndex + 1,
      total: cards.length,
    },
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
  }
}
