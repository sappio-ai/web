/**
 * Usage tracking and plan limit types
 */

export type PlanTier = 'free' | 'student_pro' | 'pro_plus'

export interface PlanLimits {
  plan: PlanTier
  packsPerMonth: number
  
  // Maximum limits
  cardsPerPack: number
  questionsPerQuiz: number
  mindmapNodesLimit: number
  
  // Initial generation amounts
  initialCardsPerPack: number
  initialQuestionsPerQuiz: number
  initialMindmapNodes: number
  
  // Batch sizes for on-demand generation (null for free plan)
  batchCardsSize: number | null
  batchQuestionsSize: number | null
  batchNodesSize: number | null
  
  maxPagesPerMaterial: number
  maxTokensPerMaterial: number
  priorityProcessing: boolean
}

export interface UsageCounter {
  id: string
  userId: string
  periodStart: Date
  periodEnd: Date
  packsCreated: number
  updatedAt: Date
}

export interface UsageStats {
  currentUsage: number
  limit: number
  percentUsed: number
  remaining: number
  periodStart: Date
  periodEnd: Date
  isAtLimit: boolean
  isNearLimit: boolean // 80% threshold
  hasGraceWindow: boolean
  // Extra packs fields
  extraPacksAvailable?: number
  extraPacksNearExpiration?: {
    count: number
    expiresAt: Date
  }
  totalAvailable?: number // remaining + extraPacksAvailable
}

export interface UserProfile {
  id: string
  authUserId: string
  email: string
  fullName?: string
  plan: PlanTier
  planExpiresAt?: Date
  billingAnchor: number
  timezone: string
  createdAt: Date
}

// Default plan limits as fallback
export const DEFAULT_PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    plan: 'free',
    packsPerMonth: 3,
    cardsPerPack: 35,
    questionsPerQuiz: 8,
    mindmapNodesLimit: 40,
    initialCardsPerPack: 35,
    initialQuestionsPerQuiz: 8,
    initialMindmapNodes: 40,
    batchCardsSize: null,
    batchQuestionsSize: null,
    batchNodesSize: null,
    maxPagesPerMaterial: 50,
    maxTokensPerMaterial: 50000,
    priorityProcessing: false,
  },
  student_pro: {
    plan: 'student_pro',
    packsPerMonth: 50,
    cardsPerPack: 120,
    questionsPerQuiz: 30,
    mindmapNodesLimit: 250,
    initialCardsPerPack: 20,
    initialQuestionsPerQuiz: 10,
    initialMindmapNodes: 50,
    batchCardsSize: 30,
    batchQuestionsSize: 10,
    batchNodesSize: 60,
    maxPagesPerMaterial: 200,
    maxTokensPerMaterial: 200000,
    priorityProcessing: true,
  },
  pro_plus: {
    plan: 'pro_plus',
    packsPerMonth: 150,
    cardsPerPack: 200,
    questionsPerQuiz: 60,
    mindmapNodesLimit: 800,
    initialCardsPerPack: 25,
    initialQuestionsPerQuiz: 15,
    initialMindmapNodes: 60,
    batchCardsSize: 50,
    batchQuestionsSize: 15,
    batchNodesSize: 100,
    maxPagesPerMaterial: 500,
    maxTokensPerMaterial: 500000,
    priorityProcessing: true,
  },
}
