// Flashcard types for the Learning Systems feature

export interface Flashcard {
  id: string
  study_pack_id: string
  front: string
  back: string
  kind: 'qa' | 'cloze'
  topic: string | null
  ease: number
  interval_days: number
  due_at: string | null
  reps: number
  lapses: number
  created_at: string
}

export interface FlashcardSession {
  cards: Flashcard[]
  currentIndex: number
  isFlipped: boolean
  sessionStats: SessionStats
  startTime: number
}

export interface SessionStats {
  cardsReviewed: number
  again: number
  hard: number
  good: number
  easy: number
  accuracy: number
  averageTime: number
  totalTime: number
}

export type Grade = 'again' | 'hard' | 'good' | 'easy'

export interface GradeResult {
  newEase: number
  newInterval: number
  newDueAt: string
  newReps: number
  newLapses: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastReviewDate: string | null
  totalReviews: number
}

export interface CardProgress {
  new: number
  learning: number
  review: number
  mastered: number
}

export interface ReviewSession {
  id: string
  user_id: string
  study_pack_id: string
  started_at: string
  ended_at: string | null
  cards_reviewed: number
  accuracy: number | null
  topic_filter: string | null
  created_at: string
}
