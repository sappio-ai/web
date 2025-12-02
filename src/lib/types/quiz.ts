// Quiz-related type definitions

export interface Quiz {
  id: string
  study_pack_id: string
  config_json: Record<string, any>
  created_at: string
  items?: QuizItem[]
  isWeakTopicQuiz?: boolean
  weakTopics?: string[]
}

export interface QuizItem {
  id: string
  quiz_id: string
  type: 'mcq'
  question: string
  answer: string
  options_json: string[]
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
