/**
 * Usage tracking and plan limit types
 */

export type PlanTier = 'free' | 'student_pro' | 'pro_plus'

export interface PlanLimits {
  plan: PlanTier
  packsPerMonth: number
  cardsPerPack: number
  questionsPerQuiz: number
  maxPagesPerMaterial: number
  maxTokensPerMaterial: number
  mindmapNodesLimit: number
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
    cardsPerPack: 25,
    questionsPerQuiz: 10,
    maxPagesPerMaterial: 50,
    maxTokensPerMaterial: 50000,
    mindmapNodesLimit: 20,
    priorityProcessing: false,
  },
  student_pro: {
    plan: 'student_pro',
    packsPerMonth: 300,
    cardsPerPack: 300,
    questionsPerQuiz: 30,
    maxPagesPerMaterial: 200,
    maxTokensPerMaterial: 200000,
    mindmapNodesLimit: 100,
    priorityProcessing: true,
  },
  pro_plus: {
    plan: 'pro_plus',
    packsPerMonth: 1000,
    cardsPerPack: 500,
    questionsPerQuiz: 50,
    maxPagesPerMaterial: 500,
    maxTokensPerMaterial: 500000,
    mindmapNodesLimit: 200,
    priorityProcessing: true,
  },
}
