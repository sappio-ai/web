# Design Document

## Overview

The Learning Systems feature brings generated study content to life through interactive flashcard reviews and quiz-taking experiences. This design builds upon the existing study pack generation (Phase 3) by adding the missing `/study-packs/[id]` page and implementing two core learning modes: SRS-based flashcard reviews and adaptive quiz sessions.

### Key Design Goals

1. **Immediate Value**: Users can start learning within seconds of pack generation completion
2. **Retention-Focused**: SRS algorithm optimizes long-term memory retention
3. **Engaging UX**: Smooth animations, instant feedback, and encouraging Orb avatars
4. **Performance**: Sub-100ms response times for card flips and answer submissions
5. **Accessibility**: Full keyboard navigation and screen reader support

### Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **State Management**: React hooks + Zustand for flashcard session state
- **Animations**: Framer Motion for card flips and transitions
- **Backend**: Next.js API Routes (App Router)
- **Database**: Supabase PostgreSQL (existing tables)
- **Caching**: In-memory cache for study pack data (5-minute TTL)
- **Real-time**: Optimistic updates for instant UI feedback

## Architecture

### High-Level Flow

```
Study Pack Page → Flashcards Tab → Review Session → SRS Algorithm → Update DB
                → Quiz Tab → Quiz Session → Grading → Save Results
                → Notes Tab (already exists)
                → Mind Map Tab (future)
                → Insights Tab (analytics)
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Page Layer (RSC)                             │
├─────────────────────────────────────────────────────────────────┤
│  /study-packs/[id]/page.tsx  │  Fetches pack data server-side   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Client Components Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  StudyPackView  │  TabNavigation  │  OrbAvatar                  │
│  FlashcardTab   │  QuizTab        │  NotesTab  │  InsightsTab   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Learning Components Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  FlashcardReview  │  FlashcardCard  │  GradingButtons           │
│  QuizInterface    │  QuestionCard   │  QuizResults              │
│  SessionStats     │  ProgressChart  │  StreakDisplay            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer                                   │
├─────────────────────────────────────────────────────────────────┤
│  /api/study-packs/[id]  │  /api/flashcards/[id]/review          │
│  /api/flashcards/due    │  /api/quizzes/[id]/submit             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  SRSService  │  QuizGradingService  │  StreakService            │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/
│   ├── study-packs/
│   │   └── [id]/
│   │       ├── page.tsx                    # Main study pack page (NEW)
│   │       └── loading.tsx                 # Loading state (NEW)
│   └── api/
│       ├── study-packs/
│       │   └── [id]/
│       │       ├── route.ts                # Already exists
│       │       └── flashcards/
│       │           └── due/
│       │               └── route.ts        # Get due cards (NEW)
│       ├── flashcards/
│       │   ├── [id]/
│       │   │   ├── review/
│       │   │   │   └── route.ts            # Submit review (NEW)
│       │   │   └── route.ts                # Edit card (NEW)
│       │   └── stats/
│       │       └── route.ts                # Session stats (NEW)
│       ├── quizzes/
│       │   └── [id]/
│       │       ├── route.ts                # Get quiz (NEW)
│       │       └── submit/
│       │           └── route.ts            # Submit answers (NEW)
│       └── quiz-results/
│           └── history/
│               └── route.ts                # Get history (NEW)
├── components/
│   ├── study-packs/
│   │   ├── StudyPackView.tsx               # Main container (NEW)
│   │   ├── TabNavigation.tsx               # Tab switcher (NEW)
│   │   ├── PackHeader.tsx                  # Title, stats (NEW)
│   │   └── tabs/
│   │       ├── FlashcardsTab.tsx           # Flashcard tab (NEW)
│   │       ├── QuizTab.tsx                 # Quiz tab (NEW)
│   │       ├── NotesTab.tsx                # Notes display (NEW)
│   │       └── InsightsTab.tsx             # Analytics (NEW)
│   ├── flashcards/
│   │   ├── FlashcardReview.tsx             # Review session (NEW)
│   │   ├── FlashcardCard.tsx               # Single card (NEW)
│   │   ├── GradingButtons.tsx              # SRS buttons (NEW)
│   │   ├── SessionStats.tsx                # Post-session (NEW)
│   │   ├── DueQueue.tsx                    # Due cards list (NEW)
│   │   ├── ProgressChart.tsx               # Visual progress (NEW)
│   │   ├── TopicFilter.tsx                 # Filter by topic (NEW)
│   │   ├── CardEditor.tsx                  # Edit modal (NEW)
│   │   └── StreakDisplay.tsx               # Streak counter (NEW)
│   └── quiz/
│       ├── QuizInterface.tsx               # Quiz container (NEW)
│       ├── QuestionCard.tsx                # Single question (NEW)
│       ├── MCQOptions.tsx                  # Multiple choice (NEW)
│       ├── ShortAnswerInput.tsx            # Text input (NEW)
│       ├── QuizResults.tsx                 # Results screen (NEW)
│       ├── QuizHistory.tsx                 # Past attempts (NEW)
│       ├── ModeSelector.tsx                # Practice/Timed (NEW)
│       ├── TimerDisplay.tsx                # Countdown (NEW)
│       └── WeakTopics.tsx                  # Weak areas (NEW)
├── lib/
│   ├── services/
│   │   ├── SRSService.ts                   # SRS algorithm (NEW)
│   │   ├── QuizGradingService.ts           # Answer grading (NEW)
│   │   └── StreakService.ts                # Streak tracking (NEW)
│   ├── hooks/
│   │   ├── useFlashcardSession.ts          # Session state (NEW)
│   │   ├── useQuizSession.ts               # Quiz state (NEW)
│   │   └── useKeyboardShortcuts.ts         # Keyboard nav (NEW)
│   └── types/
│       ├── flashcards.ts                   # Flashcard types (NEW)
│       └── quiz.ts                         # Quiz types (NEW)
└── stores/
    └── flashcardStore.ts                   # Zustand store (NEW)
```


## Components and Interfaces

### 1. Study Pack Page (Server Component)

**File: `src/app/study-packs/[id]/page.tsx`**

This is the main entry point that replaces the current 404. It fetches study pack data server-side and passes it to client components.

```typescript
// Server Component
export default async function StudyPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch study pack with all related data
  const { data: pack, error } = await supabase
    .from('study_packs')
    .select(`
      *,
      materials(id, kind, source_url, page_count),
      flashcards(count),
      quizzes(id, quiz_items(count))
    `)
    .eq('id', id)
    .single()
  
  if (error || !pack) {
    notFound()
  }
  
  return <StudyPackView pack={pack} />
}
```

**Key Features:**
- Server-side data fetching for SEO and performance
- Automatic 404 handling for missing packs
- Passes data to client component for interactivity

### 2. Study Pack View Component

**File: `src/components/study-packs/StudyPackView.tsx`**

Main client component that manages tab state and displays pack content.

```typescript
'use client'

interface StudyPackViewProps {
  pack: StudyPack
}

export default function StudyPackView({ pack }: StudyPackViewProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz' | 'insights'>('notes')
  
  return (
    <div className="min-h-screen bg-[#0A0F1A]">
      <PackHeader pack={pack} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'notes' && <NotesTab notes={pack.stats_json?.notes} />}
        {activeTab === 'flashcards' && <FlashcardsTab packId={pack.id} />}
        {activeTab === 'quiz' && <QuizTab packId={pack.id} />}
        {activeTab === 'insights' && <InsightsTab packId={pack.id} />}
      </div>
    </div>
  )
}
```

### 3. Flashcard Review Component

**File: `src/components/flashcards/FlashcardReview.tsx`**

Manages the flashcard review session with SRS grading.

```typescript
'use client'

interface FlashcardReviewProps {
  packId: string
  topicFilter?: string
}

export default function FlashcardReview({ packId, topicFilter }: FlashcardReviewProps) {
  const {
    currentCard,
    isFlipped,
    progress,
    sessionStats,
    isComplete,
    flip,
    grade,
    nextCard
  } = useFlashcardSession(packId, topicFilter)
  
  if (isComplete) {
    return <SessionStats stats={sessionStats} />
  }
  
  return (
    <div className="flex flex-col items-center">
      <Orb pose="study-focused" size="lg" />
      
      <div className="text-center mb-4">
        <p className="text-gray-400">Card {progress.current} of {progress.total}</p>
      </div>
      
      <FlashcardCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={flip}
      />
      
      {!isFlipped ? (
        <button onClick={flip} className="mt-6 btn-primary">
          Show Answer (Space)
        </button>
      ) : (
        <GradingButtons onGrade={grade} />
      )}
    </div>
  )
}
```

### 4. Flashcard Card Component

**File: `src/components/flashcards/FlashcardCard.tsx`**

Displays a single flashcard with flip animation.

```typescript
'use client'

import { motion } from 'framer-motion'

interface FlashcardCardProps {
  card: Flashcard
  isFlipped: boolean
  onFlip: () => void
}

export default function FlashcardCard({ card, isFlipped, onFlip }: FlashcardCardProps) {
  return (
    <motion.div
      className="relative w-full max-w-2xl h-96 cursor-pointer"
      onClick={onFlip}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Front Side */}
      <div
        className="absolute inset-0 backface-hidden bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8 flex items-center justify-center"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <p className="text-2xl text-white text-center">{card.front}</p>
      </div>
      
      {/* Back Side */}
      <div
        className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#a8d5d5]/20 to-[#8bc5c5]/20 backdrop-blur-2xl rounded-2xl border border-[#a8d5d5]/30 p-8 flex items-center justify-center"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <p className="text-2xl text-white text-center">{card.back}</p>
      </div>
    </motion.div>
  )
}
```

### 5. Grading Buttons Component

**File: `src/components/flashcards/GradingButtons.tsx`**

SRS grading interface with keyboard shortcuts.

```typescript
'use client'

interface GradingButtonsProps {
  onGrade: (grade: 'again' | 'hard' | 'good' | 'easy') => void
}

export default function GradingButtons({ onGrade }: GradingButtonsProps) {
  useKeyboardShortcuts({
    '1': () => onGrade('again'),
    '2': () => onGrade('hard'),
    '3': () => onGrade('good'),
    '4': () => onGrade('easy'),
  })
  
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => onGrade('again')}
        className="btn-grade btn-again"
      >
        Again (1)
        <span className="text-xs">< 1 day</span>
      </button>
      
      <button
        onClick={() => onGrade('hard')}
        className="btn-grade btn-hard"
      >
        Hard (2)
        <span className="text-xs">1-3 days</span>
      </button>
      
      <button
        onClick={() => onGrade('good')}
        className="btn-grade btn-good"
      >
        Good (3)
        <span className="text-xs">4-7 days</span>
      </button>
      
      <button
        onClick={() => onGrade('easy')}
        className="btn-grade btn-easy"
      >
        Easy (4)
        <span className="text-xs">7+ days</span>
      </button>
    </div>
  )
}
```

### 6. Quiz Interface Component

**File: `src/components/quiz/QuizInterface.tsx`**

Main quiz taking interface with mode selection.

```typescript
'use client'

interface QuizInterfaceProps {
  quizId: string
}

export default function QuizInterface({ quizId }: QuizInterfaceProps) {
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
    selectMode,
    submitAnswer,
    nextQuestion
  } = useQuizSession(quizId)
  
  if (!mode) {
    return <ModeSelector onSelectMode={selectMode} />
  }
  
  if (isComplete) {
    return <QuizResults results={results} />
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400">
          Question {progress.current} of {progress.total}
        </p>
        {mode === 'timed' && (
          <TimerDisplay timeRemaining={timeRemaining} />
        )}
      </div>
      
      <QuestionCard
        question={currentQuestion}
        userAnswer={userAnswer}
        isAnswered={isAnswered}
        feedback={feedback}
        onSubmit={submitAnswer}
      />
      
      {isAnswered && (
        <button onClick={nextQuestion} className="mt-6 btn-primary">
          Next Question
        </button>
      )}
    </div>
  )
}
```

### 7. Question Card Component

**File: `src/components/quiz/QuestionCard.tsx`**

Displays a quiz question with answer options or input.

```typescript
'use client'

interface QuestionCardProps {
  question: QuizItem
  userAnswer: string | null
  isAnswered: boolean
  feedback: QuizFeedback | null
  onSubmit: (answer: string) => void
}

export default function QuestionCard({
  question,
  userAnswer,
  isAnswered,
  feedback,
  onSubmit
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  
  return (
    <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8">
      <h3 className="text-2xl text-white mb-6">{question.question}</h3>
      
      {question.type === 'mcq' ? (
        <MCQOptions
          options={question.options_json as string[]}
          selectedAnswer={selectedAnswer}
          correctAnswer={isAnswered ? question.answer : null}
          onSelect={setSelectedAnswer}
          disabled={isAnswered}
        />
      ) : (
        <ShortAnswerInput
          value={selectedAnswer}
          onChange={setSelectedAnswer}
          disabled={isAnswered}
        />
      )}
      
      {!isAnswered && (
        <button
          onClick={() => onSubmit(selectedAnswer)}
          disabled={!selectedAnswer}
          className="mt-6 btn-primary"
        >
          Submit Answer
        </button>
      )}
      
      {isAnswered && feedback && (
        <div className={`mt-6 p-4 rounded-lg ${
          feedback.isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Orb pose={feedback.isCorrect ? 'encouraging-happy' : 'supportive-gentle'} size="sm" />
            <p className={`font-bold ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
          </div>
          {!feedback.isCorrect && (
            <p className="text-gray-300 mb-2">Correct answer: {question.answer}</p>
          )}
          <p className="text-gray-400 text-sm">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
```


## Data Models and Types

### Flashcard Types

```typescript
// src/lib/types/flashcards.ts

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
```

### Quiz Types

```typescript
// src/lib/types/quiz.ts

export interface Quiz {
  id: string
  study_pack_id: string
  config_json: Record<string, any>
  created_at: string
  items: QuizItem[]
}

export interface QuizItem {
  id: string
  quiz_id: string
  type: 'mcq' | 'short_answer'
  question: string
  answer: string
  options_json: string[] | null
  explanation: string | null
  topic: string | null
}

export interface QuizSession {
  quizId: string
  mode: 'practice' | 'timed'
  questions: QuizItem[]
  currentIndex: number
  userAnswers: Map<string, string>
  startTime: number
  timeLimit: number | null
  isComplete: boolean
}

export interface QuizAnswer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
}

export interface QuizResult {
  id: string
  quiz_id: string
  user_id: string
  score: number
  duration_s: number
  taken_at: string
  detail_json: {
    answers: QuizAnswer[]
    topicPerformance: Record<string, TopicPerformance>
  }
}

export interface TopicPerformance {
  topic: string
  correct: number
  total: number
  accuracy: number
  isWeak: boolean
}

export interface QuizFeedback {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
}
```

## Service Layer

### 1. SRS Service

**File: `src/lib/services/SRSService.ts`**

Implements the SM-2 algorithm for spaced repetition.

```typescript
export class SRSService {
  /**
   * Calculate new SRS values based on user grade
   */
  static calculateNextReview(
    card: Flashcard,
    grade: Grade
  ): GradeResult {
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
      newLapses
    }
  }
  
  /**
   * Get cards due for review
   */
  static async getDueCards(
    packId: string,
    topicFilter?: string
  ): Promise<Flashcard[]> {
    const supabase = createClient()
    
    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('study_pack_id', packId)
      .lte('due_at', new Date().toISOString())
      .order('due_at', { ascending: true })
    
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
```

### 2. Quiz Grading Service

**File: `src/lib/services/QuizGradingService.ts`**

Handles quiz answer grading and result calculation.

```typescript
export class QuizGradingService {
  /**
   * Grade a single answer
   */
  static gradeAnswer(
    question: QuizItem,
    userAnswer: string
  ): boolean {
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
      str.replace(/[.,!?;:]/g, '')
         .replace(/\b(a|an|the)\b/gi, '')
         .trim()
    
    const normalizedAnswer = normalize(answer)
    const normalizedCorrect = normalize(correct)
    
    if (normalizedAnswer === normalizedCorrect) return true
    
    // Check if answer contains correct answer or vice versa
    if (normalizedAnswer.includes(normalizedCorrect) ||
        normalizedCorrect.includes(normalizedAnswer)) {
      return true
    }
    
    // Levenshtein distance for typos (max 2 character difference)
    const distance = this.levenshteinDistance(normalizedAnswer, normalizedCorrect)
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
  ): QuizResult {
    const gradedAnswers: QuizAnswer[] = []
    const topicPerformance: Record<string, TopicPerformance> = {}
    
    let correctCount = 0
    
    quiz.items.forEach((question) => {
      const userAnswer = answers.get(question.id) || ''
      const isCorrect = this.gradeAnswer(question, userAnswer)
      
      if (isCorrect) correctCount++
      
      gradedAnswers.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        timeSpent: 0 // TODO: Track per-question time
      })
      
      // Track topic performance
      const topic = question.topic || 'General'
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = {
          topic,
          correct: 0,
          total: 0,
          accuracy: 0,
          isWeak: false
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
      id: '', // Will be set by database
      quiz_id: quiz.id,
      user_id: '', // Will be set by API
      score,
      duration_s: duration,
      taken_at: new Date().toISOString(),
      detail_json: {
        answers: gradedAnswers,
        topicPerformance
      }
    }
  }
}
```

### 3. Streak Service

**File: `src/lib/services/StreakService.ts`**

Manages user study streaks.

```typescript
export class StreakService {
  /**
   * Update streak after review session
   */
  static async updateStreak(userId: string): Promise<StreakData> {
    const supabase = createClient()
    
    // Get user's current streak data
    const { data: user } = await supabase
      .from('users')
      .select('meta_json')
      .eq('id', userId)
      .single()
    
    const streakData: StreakData = user?.meta_json?.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastReviewDate: null,
      totalReviews: 0
    }
    
    const today = new Date().toISOString().split('T')[0]
    const lastReview = streakData.lastReviewDate
    
    // First review ever
    if (!lastReview) {
      streakData.currentStreak = 1
      streakData.longestStreak = 1
      streakData.lastReviewDate = today
      streakData.totalReviews = 1
    }
    // Already reviewed today
    else if (lastReview === today) {
      streakData.totalReviews++
    }
    // Reviewed yesterday (continue streak)
    else if (this.isYesterday(lastReview)) {
      streakData.currentStreak++
      streakData.longestStreak = Math.max(
        streakData.longestStreak,
        streakData.currentStreak
      )
      streakData.lastReviewDate = today
      streakData.totalReviews++
    }
    // Missed a day (reset streak)
    else {
      streakData.currentStreak = 1
      streakData.lastReviewDate = today
      streakData.totalReviews++
    }
    
    // Save updated streak
    await supabase
      .from('users')
      .update({
        meta_json: {
          ...user?.meta_json,
          streak: streakData
        }
      })
      .eq('id', userId)
    
    return streakData
  }
  
  /**
   * Check if date is yesterday
   */
  private static isYesterday(dateString: string): boolean {
    const date = new Date(dateString)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    return date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
  }
  
  /**
   * Get streak data for user
   */
  static async getStreak(userId: string): Promise<StreakData> {
    const supabase = createClient()
    
    const { data: user } = await supabase
      .from('users')
      .select('meta_json')
      .eq('id', userId)
      .single()
    
    return user?.meta_json?.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastReviewDate: null,
      totalReviews: 0
    }
  }
}
```


## Custom Hooks

### 1. useFlashcardSession Hook

**File: `src/lib/hooks/useFlashcardSession.ts`**

Manages flashcard review session state.

```typescript
export function useFlashcardSession(packId: string, topicFilter?: string) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    cardsReviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    accuracy: 0,
    averageTime: 0,
    totalTime: 0
  })
  const [startTime] = useState(Date.now())
  const [cardStartTime, setCardStartTime] = useState(Date.now())
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch due cards on mount
  useEffect(() => {
    fetchDueCards()
  }, [packId, topicFilter])
  
  const fetchDueCards = async () => {
    try {
      const response = await fetch(
        `/api/study-packs/${packId}/flashcards/due?topic=${topicFilter || ''}`
      )
      const data = await response.json()
      setCards(data.cards)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch due cards:', error)
      setIsLoading(false)
    }
  }
  
  const flip = () => {
    setIsFlipped(!isFlipped)
  }
  
  const grade = async (gradeValue: Grade) => {
    const currentCard = cards[currentIndex]
    const timeSpent = Date.now() - cardStartTime
    
    // Optimistic update
    setSessionStats(prev => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      [gradeValue]: prev[gradeValue] + 1,
      totalTime: prev.totalTime + timeSpent
    }))
    
    // Submit review to backend
    try {
      await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: gradeValue })
      })
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
    
    // Move to next card
    nextCard()
  }
  
  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setCardStartTime(Date.now())
    }
  }
  
  const currentCard = cards[currentIndex]
  const isComplete = currentIndex >= cards.length && cards.length > 0
  const progress = {
    current: currentIndex + 1,
    total: cards.length
  }
  
  // Calculate accuracy
  const accuracy = sessionStats.cardsReviewed > 0
    ? ((sessionStats.good + sessionStats.easy) / sessionStats.cardsReviewed) * 100
    : 0
  
  return {
    currentCard,
    isFlipped,
    progress,
    sessionStats: { ...sessionStats, accuracy },
    isComplete,
    isLoading,
    flip,
    grade,
    nextCard
  }
}
```

### 2. useQuizSession Hook

**File: `src/lib/hooks/useQuizSession.ts`**

Manages quiz session state.

```typescript
export function useQuizSession(quizId: string) {
  const [mode, setMode] = useState<'practice' | 'timed' | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map())
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null)
  const [startTime] = useState(Date.now())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<QuizResult | null>(null)
  
  // Fetch quiz on mount
  useEffect(() => {
    fetchQuiz()
  }, [quizId])
  
  // Timer for timed mode
  useEffect(() => {
    if (mode === 'timed' && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
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
  
  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`)
      const data = await response.json()
      setQuiz(data)
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
    }
  }
  
  const selectMode = (selectedMode: 'practice' | 'timed') => {
    setMode(selectedMode)
    if (selectedMode === 'timed' && quiz) {
      // 2 minutes per question
      setTimeRemaining(quiz.items.length * 120)
    }
  }
  
  const submitAnswer = (answer: string) => {
    if (!quiz) return
    
    const currentQuestion = quiz.items[currentIndex]
    
    // Save answer
    setUserAnswers(prev => new Map(prev).set(currentQuestion.id, answer))
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id))
    
    // Grade answer
    const isCorrect = QuizGradingService.gradeAnswer(currentQuestion, answer)
    
    setFeedback({
      isCorrect,
      correctAnswer: currentQuestion.answer,
      explanation: currentQuestion.explanation || ''
    })
  }
  
  const nextQuestion = () => {
    if (currentIndex < quiz!.items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFeedback(null)
    } else {
      submitQuiz()
    }
  }
  
  const submitQuiz = async () => {
    if (!quiz) return
    
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Array.from(userAnswers.entries()).map(([questionId, answer]) => ({
            questionId,
            answer
          })),
          startTime
        })
      })
      
      const data = await response.json()
      setResults(data.result)
      setIsComplete(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }
  }
  
  const currentQuestion = quiz?.items[currentIndex]
  const userAnswer = currentQuestion ? userAnswers.get(currentQuestion.id) : null
  const isAnswered = currentQuestion ? answeredQuestions.has(currentQuestion.id) : false
  const progress = {
    current: currentIndex + 1,
    total: quiz?.items.length || 0
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
    selectMode,
    submitAnswer,
    nextQuestion
  }
}
```

### 3. useKeyboardShortcuts Hook

**File: `src/lib/hooks/useKeyboardShortcuts.ts`**

Handles keyboard shortcuts for accessibility.

```typescript
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      
      const handler = shortcuts[key]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shortcuts])
}
```

## API Routes

### 1. Get Due Flashcards

**File: `src/app/api/study-packs/[id]/flashcards/due/route.ts`**

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: packId } = await params
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic')
    
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get due cards
    const cards = await SRSService.getDueCards(packId, topic || undefined)
    
    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Failed to get due cards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2. Submit Flashcard Review

**File: `src/app/api/flashcards/[id]/review/route.ts`**

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: cardId } = await params
    const { grade } = await request.json()
    
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get current card
    const { data: card, error: cardError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', cardId)
      .single()
    
    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    
    // Calculate new SRS values
    const result = SRSService.calculateNextReview(card, grade)
    
    // Update card
    const { error: updateError } = await supabase
      .from('flashcards')
      .update({
        ease: result.newEase,
        interval_days: result.newInterval,
        due_at: result.newDueAt,
        reps: result.newReps,
        lapses: result.newLapses
      })
      .eq('id', cardId)
    
    if (updateError) {
      throw updateError
    }
    
    // Update streak
    const streakData = await StreakService.updateStreak(user.id)
    
    // Log event
    await supabase.from('events').insert({
      user_id: user.id,
      event: 'cards_reviewed',
      props_json: {
        card_id: cardId,
        grade,
        new_interval: result.newInterval
      }
    })
    
    return NextResponse.json({
      success: true,
      result,
      streak: streakData
    })
  } catch (error) {
    console.error('Failed to submit review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3. Submit Quiz

**File: `src/app/api/quizzes/[id]/submit/route.ts`**

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: quizId } = await params
    const { answers, startTime } = await request.json()
    
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get quiz with items
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*, quiz_items(*)')
      .eq('id', quizId)
      .single()
    
    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }
    
    // Convert answers array to Map
    const answersMap = new Map(
      answers.map((a: any) => [a.questionId, a.answer])
    )
    
    // Calculate results
    const result = QuizGradingService.calculateResults(
      quiz,
      answersMap,
      startTime
    )
    
    // Save result
    const { data: savedResult, error: saveError } = await supabase
      .from('quiz_results')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        score: result.score,
        duration_s: result.duration_s,
        detail_json: result.detail_json
      })
      .select()
      .single()
    
    if (saveError) {
      throw saveError
    }
    
    // Log event
    await supabase.from('events').insert({
      user_id: user.id,
      event: 'quiz_completed',
      props_json: {
        quiz_id: quizId,
        score: result.score,
        duration: result.duration_s
      }
    })
    
    return NextResponse.json({
      success: true,
      result: savedResult
    })
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```


## Styling and Animations

### Tailwind CSS Classes

```css
/* Flashcard Grading Buttons */
.btn-grade {
  @apply flex flex-col items-center gap-1 px-6 py-4 rounded-xl font-bold transition-all;
  @apply hover:scale-105 active:scale-95;
}

.btn-again {
  @apply bg-red-500/10 border-2 border-red-500/30 text-red-400;
  @apply hover:bg-red-500/20 hover:border-red-500/50;
}

.btn-hard {
  @apply bg-orange-500/10 border-2 border-orange-500/30 text-orange-400;
  @apply hover:bg-orange-500/20 hover:border-orange-500/50;
}

.btn-good {
  @apply bg-green-500/10 border-2 border-green-500/30 text-green-400;
  @apply hover:bg-green-500/20 hover:border-green-500/50;
}

.btn-easy {
  @apply bg-blue-500/10 border-2 border-blue-500/30 text-blue-400;
  @apply hover:bg-blue-500/20 hover:border-blue-500/50;
}

/* Quiz Options */
.quiz-option {
  @apply p-4 rounded-lg border-2 transition-all cursor-pointer;
  @apply hover:scale-[1.02] active:scale-[0.98];
}

.quiz-option-default {
  @apply border-white/20 bg-white/5 hover:bg-white/10;
}

.quiz-option-selected {
  @apply border-[#a8d5d5] bg-[#a8d5d5]/10;
}

.quiz-option-correct {
  @apply border-green-500 bg-green-500/10;
}

.quiz-option-incorrect {
  @apply border-red-500 bg-red-500/10;
}
```

### Framer Motion Variants

```typescript
// Card flip animation
export const cardFlipVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.6, type: 'spring' }
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.6, type: 'spring' }
  }
}

// Slide in animation for new cards
export const cardSlideVariants = {
  enter: {
    x: 100,
    opacity: 0
  },
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

// Progress bar animation
export const progressBarVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.5, ease: 'easeOut' }
  })
}
```

## Error Handling

### Error Types

```typescript
export enum LearningErrorCode {
  CARD_NOT_FOUND = 'card_not_found',
  QUIZ_NOT_FOUND = 'quiz_not_found',
  INVALID_GRADE = 'invalid_grade',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export const errorMessages: Record<LearningErrorCode, string> = {
  card_not_found: 'Flashcard not found. It may have been deleted.',
  quiz_not_found: 'Quiz not found. It may have been deleted.',
  invalid_grade: 'Invalid grade value. Please try again.',
  session_expired: 'Your session has expired. Please log in again.',
  network_error: 'Network error. Please check your connection.',
  unknown_error: 'Something went wrong. Please try again.'
}
```

### Error Boundary Component

```typescript
'use client'

export class LearningErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Learning error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Orb pose="error-confused" size="lg" />
          <h2 className="mt-6 text-2xl font-bold text-white">
            Something went wrong
          </h2>
          <p className="mt-2 text-gray-400">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 btn-primary"
          >
            Reload Page
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

## Performance Optimizations

### 1. Optimistic Updates

For flashcard reviews, update the UI immediately and sync with the backend in the background:

```typescript
const grade = async (gradeValue: Grade) => {
  // Update UI immediately
  setSessionStats(prev => ({
    ...prev,
    [gradeValue]: prev[gradeValue] + 1
  }))
  
  // Move to next card
  nextCard()
  
  // Sync with backend (non-blocking)
  fetch(`/api/flashcards/${currentCard.id}/review`, {
    method: 'POST',
    body: JSON.stringify({ grade: gradeValue })
  }).catch(error => {
    // Queue for retry if failed
    queueFailedReview(currentCard.id, gradeValue)
  })
}
```

### 2. Prefetching

Prefetch the next 3 cards while user is reviewing:

```typescript
useEffect(() => {
  if (currentIndex < cards.length - 3) {
    // Prefetch next 3 cards' images if they have any
    for (let i = currentIndex + 1; i <= currentIndex + 3; i++) {
      if (cards[i]?.image_url) {
        const img = new Image()
        img.src = cards[i].image_url
      }
    }
  }
}, [currentIndex, cards])
```

### 3. Caching

Cache study pack data for 5 minutes:

```typescript
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const cache = new Map<string, { data: any; timestamp: number }>()

export function getCachedPack(packId: string) {
  const cached = cache.get(packId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

export function setCachedPack(packId: string, data: any) {
  cache.set(packId, { data, timestamp: Date.now() })
}
```

## Accessibility Features

### 1. Keyboard Navigation

```typescript
// Flashcard shortcuts
Space: Flip card
1: Grade "Again"
2: Grade "Hard"
3: Grade "Good"
4: Grade "Easy"
Escape: Exit session

// Quiz shortcuts
1-4: Select MCQ option (for questions with 4 options)
Enter: Submit answer
Arrow keys: Navigate between questions (after answering)
```

### 2. Screen Reader Announcements

```typescript
<div role="status" aria-live="polite" aria-atomic="true">
  {isFlipped ? (
    <span className="sr-only">
      Answer revealed: {currentCard.back}
    </span>
  ) : (
    <span className="sr-only">
      Question: {currentCard.front}
    </span>
  )}
</div>
```

### 3. Focus Management

```typescript
useEffect(() => {
  // Focus on first grading button when card is flipped
  if (isFlipped) {
    const firstButton = document.querySelector('.btn-grade')
    if (firstButton instanceof HTMLElement) {
      firstButton.focus()
    }
  }
}, [isFlipped])
```

## Testing Strategy

### Unit Tests

- SRS algorithm calculations
- Quiz grading logic (exact match, fuzzy match, Levenshtein distance)
- Streak calculation
- Progress categorization

### Integration Tests

- Flashcard review flow (fetch → flip → grade → update)
- Quiz submission flow (fetch → answer → submit → results)
- Streak update after review session

### E2E Tests (Future)

- Complete flashcard review session
- Complete quiz in practice mode
- Complete quiz in timed mode
- Edit flashcard content
- Filter flashcards by topic

### Manual Testing Checklist

- [ ] Study pack page loads correctly
- [ ] Flashcard review session works
- [ ] Card flip animation is smooth
- [ ] SRS grading updates database
- [ ] Streak increments correctly
- [ ] Quiz practice mode works
- [ ] Quiz timed mode works with countdown
- [ ] Quiz results display correctly
- [ ] Weak topics are identified
- [ ] Quiz history displays past attempts
- [ ] Keyboard shortcuts work
- [ ] Screen reader announces content
- [ ] Mobile swipe gestures work
- [ ] Reduced motion preference respected
- [ ] Error states display correctly

## Security Considerations

1. **Authorization**: All API routes verify user owns the study pack
2. **Input Validation**: Validate grade values and quiz answers
3. **Rate Limiting**: Prevent abuse of review/quiz submission endpoints (future)
4. **Data Privacy**: User answers and performance data are private
5. **XSS Prevention**: Sanitize user-generated content in flashcard edits

## Mobile Responsiveness

### Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

### Mobile-Specific Features

1. **Touch Gestures**:
   - Swipe up: Flip card
   - Swipe left: Grade "Again"
   - Swipe right: Grade "Good"
   - Tap: Select quiz option

2. **Layout Adjustments**:
   - Single column for quiz questions
   - Larger touch targets (min 44x44px)
   - Simplified navigation
   - Bottom sheet for grading buttons

3. **Performance**:
   - Lazy load images
   - Reduce animation complexity
   - Optimize bundle size

## Next Steps After Implementation

Once Phases 4 & 5 are complete, the following will be ready:
- Users can review flashcards with SRS algorithm
- Users can take quizzes in practice or timed mode
- Streak tracking motivates daily reviews
- Weak topic identification guides study focus
- Complete learning loop: Upload → Generate → Study → Master

**Future Enhancements (Not in this spec):**
- Mind Map interactive editing (Phase 6)
- Export system (Phase 7)
- Dashboard with pack management (Phase 8)
- Advanced analytics and insights (Phase 9)
- Exam Coach mode (Phase 10)

