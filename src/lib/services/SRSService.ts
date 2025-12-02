// SRS (Spaced Repetition System) Service
// Implements SM-2 algorithm for flashcard scheduling

import { createClient } from '@/lib/supabase/server'
import type {
  Flashcard,
  Grade,
  GradeResult,
  CardProgress,
} from '@/lib/types/flashcards'

export class SRSService {
  /**
   * Calculate new SRS values based on user grade
   * Implements modified SM-2 algorithm
   */
  static calculateNextReview(card: Flashcard, grade: Grade): GradeResult {
    const { ease, interval_days, reps, lapses } = card

    let newEase = ease
    let newInterval = interval_days
    let newReps = reps
    let newLapses = lapses

    // First review (new card)
    if (reps === 0) {
      switch (grade) {
        case 'again':
          newInterval = 0
          newLapses++
          newEase = Math.max(1.3, ease - 0.2)
          break
        case 'hard':
          newInterval = 1
          newReps++
          newEase = Math.max(1.3, ease - 0.15)
          break
        case 'good':
          newInterval = 1
          newReps++
          break
        case 'easy':
          newInterval = 4
          newReps++
          newEase = Math.min(2.5, ease + 0.15)
          break
      }
    }
    // Second review
    else if (reps === 1) {
      switch (grade) {
        case 'again':
          newInterval = 0
          newLapses++
          newReps = 0 // Reset to new
          newEase = Math.max(1.3, ease - 0.2)
          break
        case 'hard':
          newInterval = 1
          newReps++
          newEase = Math.max(1.3, ease - 0.15)
          break
        case 'good':
          newInterval = 6
          newReps++
          break
        case 'easy':
          newInterval = 10
          newReps++
          newEase = Math.min(2.5, ease + 0.15)
          break
      }
    }
    // Subsequent reviews
    else {
      switch (grade) {
        case 'again':
          newInterval = 0
          newLapses++
          newReps = 0 // Reset to new
          newEase = Math.max(1.3, ease - 0.2)
          break
        case 'hard':
          newInterval = Math.max(1, Math.round(interval_days * 1.2))
          newReps++
          newEase = Math.max(1.3, ease - 0.15)
          break
        case 'good':
          newInterval = Math.round(interval_days * ease)
          newReps++
          break
        case 'easy':
          newInterval = Math.round(interval_days * ease * 1.3)
          newReps++
          newEase = Math.min(2.5, ease + 0.15)
          break
      }
    }

    // Calculate new due date
    const newDueAt = new Date()
    newDueAt.setDate(newDueAt.getDate() + newInterval)

    return {
      newEase,
      newInterval,
      newDueAt: newDueAt.toISOString(),
      newReps,
      newLapses,
    }
  }

  /**
   * Get cards due for review
   */
  static async getDueCards(
    packId: string,
    topicFilter?: string
  ): Promise<Flashcard[]> {
    const supabase = await createClient()

    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('study_pack_id', packId)
      .or(`due_at.is.null,due_at.lte.${new Date().toISOString()}`)
      .order('due_at', { ascending: true, nullsFirst: true })

    if (topicFilter) {
      query = query.eq('topic', topicFilter)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Calculate card progress distribution
   */
  static calculateProgress(cards: Flashcard[]): CardProgress {
    return cards.reduce(
      (acc, card) => {
        if (card.reps === 0) acc.new++
        else if (card.reps < 5) acc.learning++
        else if (card.interval_days < 30) acc.review++
        else acc.mastered++
        return acc
      },
      { new: 0, learning: 0, review: 0, mastered: 0 }
    )
  }
}
