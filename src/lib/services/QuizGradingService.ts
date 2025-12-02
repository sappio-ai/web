// Quiz grading service with fuzzy matching for short answers

import type {
  Quiz,
  QuizItem,
  QuizAnswer,
  QuizResult,
  TopicPerformance,
} from '@/lib/types/quiz'

export class QuizGradingService {
  /**
   * Grade a single answer
   */
  static gradeAnswer(question: QuizItem, userAnswer: string): boolean {
    const correctAnswer = question.answer.toLowerCase().trim()
    const userAnswerNormalized = userAnswer.toLowerCase().trim()

    if (question.type === 'mcq') {
      return userAnswerNormalized === correctAnswer
    }

    // Short answer: fuzzy matching
    return this.fuzzyMatch(userAnswerNormalized, correctAnswer)
  }

  /**
   * Fuzzy match for short answers
   */
  private static fuzzyMatch(answer: string, correct: string): boolean {
    // Exact match
    if (answer === correct) return true

    // Remove common articles and punctuation
    const normalize = (str: string) =>
      str
        .replace(/[.,!?;:]/g, '')
        .replace(/\b(a|an|the)\b/gi, '')
        .trim()

    const normalizedAnswer = normalize(answer)
    const normalizedCorrect = normalize(correct)

    if (normalizedAnswer === normalizedCorrect) return true

    // Check if answer contains correct answer or vice versa
    if (
      normalizedAnswer.includes(normalizedCorrect) ||
      normalizedCorrect.includes(normalizedAnswer)
    ) {
      return true
    }

    // Levenshtein distance for typos (max 2 character difference)
    const distance = this.levenshteinDistance(
      normalizedAnswer,
      normalizedCorrect
    )
    return distance <= 2
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  /**
   * Calculate quiz results
   */
  static calculateResults(
    quiz: Quiz,
    answers: Map<string, string>,
    startTime: number
  ): Omit<QuizResult, 'id' | 'user_id'> {
    const gradedAnswers: QuizAnswer[] = []
    const topicPerformance: Record<string, TopicPerformance> = {}

    let correctCount = 0

    if (!quiz.items) {
      throw new Error('Quiz items are required')
    }

    quiz.items.forEach((question) => {
      const userAnswer = answers.get(question.id) || ''
      const isCorrect = this.gradeAnswer(question, userAnswer)

      if (isCorrect) correctCount++

      gradedAnswers.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        timeSpent: 0, // TODO: Track per-question time
      })

      // Track topic performance
      const topic = question.topic || 'General'
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = {
          topic,
          correct: 0,
          total: 0,
          accuracy: 0,
          isWeak: false,
        }
      }

      topicPerformance[topic].total++
      if (isCorrect) topicPerformance[topic].correct++
    })

    // Calculate topic accuracies and identify weak topics
    Object.values(topicPerformance).forEach((perf) => {
      perf.accuracy = (perf.correct / perf.total) * 100
      perf.isWeak = perf.accuracy < 70
    })

    const duration = Math.floor((Date.now() - startTime) / 1000)
    const score = (correctCount / quiz.items.length) * 100

    return {
      quiz_id: quiz.id,
      score,
      duration_s: duration,
      taken_at: new Date().toISOString(),
      detail_json: {
        answers: gradedAnswers,
        topicPerformance,
      },
    }
  }
}
