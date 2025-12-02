// Custom hook for managing quiz session state

import { useState, useEffect, useCallback } from 'react'
import { QuizGradingService } from '@/lib/services/QuizGradingService'
import type {
  Quiz,
  QuizItem,
  QuizFeedback,
  QuizResult,
} from '@/lib/types/quiz'

interface UseQuizSessionReturn {
  mode: 'practice' | 'timed' | null
  currentQuestion: QuizItem | null
  userAnswer: string | null
  isAnswered: boolean
  feedback: QuizFeedback | null
  progress: { current: number; total: number }
  timeRemaining: number | null
  isComplete: boolean
  results: QuizResult | null
  isLoading: boolean
  error: string | null
  isSubmitting: boolean
  selectMode: (mode: 'practice' | 'timed') => void
  submitAnswer: (answer: string) => void
  nextQuestion: () => void
  restartQuiz: () => void
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function useQuizSession(
  quizId: string,
  providedQuiz?: Quiz
): UseQuizSessionReturn {
  const [mode, setMode] = useState<'practice' | 'timed' | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(providedQuiz || null)
  const [shuffledQuiz, setShuffledQuiz] = useState<Quiz | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(
    new Map()
  )
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  )
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null)
  const [startTime] = useState(Date.now())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(!providedQuiz)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch quiz on mount (only if not provided)
  useEffect(() => {
    if (!providedQuiz) {
      fetchQuiz()
    } else {
      // Shuffle provided quiz
      setShuffledQuiz(shuffleQuizOptions(providedQuiz))
    }
  }, [quizId, providedQuiz])

  // Shuffle quiz when loaded
  useEffect(() => {
    if (quiz && !shuffledQuiz) {
      setShuffledQuiz(shuffleQuizOptions(quiz))
    }
  }, [quiz])

  // Timer for timed mode
  useEffect(() => {
    if (mode === 'timed' && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            submitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [mode, timeRemaining])

  // Shuffle quiz options while preserving correct answer
  const shuffleQuizOptions = (quiz: Quiz): Quiz => {
    if (!quiz.items) return quiz

    const shuffledItems = quiz.items.map((item) => {
      if (!item.options_json || item.options_json.length === 0) {
        return item
      }

      // Shuffle the options
      const shuffledOptions = shuffleArray(item.options_json)

      return {
        ...item,
        options_json: shuffledOptions,
      }
    })

    return {
      ...quiz,
      items: shuffledItems,
    }
  }

  const fetchQuiz = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/quizzes/${quizId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch quiz')
      }

      const data = await response.json()
      setQuiz(data.quiz)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const selectMode = useCallback(
    (selectedMode: 'practice' | 'timed') => {
      setMode(selectedMode)
      if (selectedMode === 'timed' && shuffledQuiz?.items) {
        // 2 minutes per question
        setTimeRemaining(shuffledQuiz.items.length * 120)
      }
    },
    [shuffledQuiz]
  )

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!shuffledQuiz?.items || !quiz?.items) return

      const currentQuestion = shuffledQuiz.items[currentIndex]
      const originalQuestion = quiz.items.find((q) => q.id === currentQuestion.id)

      if (!originalQuestion) return

      // Save answer
      setUserAnswers((prev) => new Map(prev).set(currentQuestion.id, answer))
      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestion.id))

      // Grade answer using ORIGINAL question (with unshuffled answer)
      const isCorrect = QuizGradingService.gradeAnswer(
        originalQuestion,
        answer
      )

      setFeedback({
        isCorrect,
        correctAnswer: originalQuestion.answer,
        explanation: originalQuestion.explanation || '',
      })
    },
    [shuffledQuiz, quiz, currentIndex]
  )

  const nextQuestion = useCallback(() => {
    if (!shuffledQuiz?.items) return

    if (currentIndex < shuffledQuiz.items.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setFeedback(null)
    } else {
      submitQuiz()
    }
  }, [shuffledQuiz, currentIndex])

  const submitQuiz = async () => {
    if (!quiz || isSubmitting) return

    try {
      setIsSubmitting(true)

      // Retry logic for quiz submission
      let retries = 3
      let lastError: Error | null = null

      while (retries > 0) {
        try {
          const response = await fetch(`/api/quizzes/${quizId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answers: Array.from(userAnswers.entries()).map(
                ([questionId, answer]) => ({
                  questionId,
                  answer,
                })
              ),
              startTime,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to submit quiz')
          }

          const data = await response.json()
          setResults(data.result)
          setIsComplete(true)
          break // Success
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error')
          retries--

          if (retries === 0) {
            // All retries failed
            setError(
              'Failed to submit quiz. Your answers are saved. Please try again.'
            )
          } else {
            // Wait before retry (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, (4 - retries) * 1000)
            )
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Restart quiz
  const restartQuiz = useCallback(() => {
    setMode(null)
    setCurrentIndex(0)
    setUserAnswers(new Map())
    setAnsweredQuestions(new Set())
    setFeedback(null)
    setTimeRemaining(null)
    setIsComplete(false)
    setResults(null)
    setError(null)
    // Re-shuffle the quiz
    if (quiz) {
      setShuffledQuiz(shuffleQuizOptions(quiz))
    }
  }, [quiz])

  const currentQuestion = shuffledQuiz?.items?.[currentIndex] || null
  const userAnswer = currentQuestion
    ? userAnswers.get(currentQuestion.id) || null
    : null
  const isAnswered = currentQuestion
    ? answeredQuestions.has(currentQuestion.id)
    : false
  const progress = {
    current: currentIndex + 1,
    total: shuffledQuiz?.items?.length || 0,
  }

  return {
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
  }
}
