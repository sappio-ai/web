/**
 * Property-based tests for grace window behavior
 * Feature: pricing-tier-implementation
 * Validates: Requirements 7.1, 7.2, 7.3
 */

import * as fc from 'fast-check'
import { UsageService } from '../UsageService'
import type { PlanTier } from '@/lib/types/usage'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn(),
}))

describe('Grace Window Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Property 7: Grace window allows exactly one extra pack
   * Validates: Requirements 7.1, 7.2, 7.3
   */
  test('Property 7: Grace window allows exactly one extra pack', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 1, max: 300 }), // pack limit
        async (plan, packLimit) => {
          // Mock user at limit
          const mockUser = {
            id: 'test-user',
            authUserId: 'auth-user',
            email: 'test@example.com',
            plan,
            billingAnchor: 1,
            timezone: 'UTC',
            createdAt: new Date(),
          }

          const mockLimits = {
            plan,
            packsPerMonth: packLimit,
            cardsPerPack: 100,
            questionsPerQuiz: 20,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            priorityProcessing: plan !== 'free',
          }

          // Spy on methods
          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)

          // Test at limit - 1 (should allow)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(packLimit - 1)
          const resultBelowLimit = await UsageService.canCreatePack('test-user')
          expect(resultBelowLimit.allowed).toBe(true)
          expect(resultBelowLimit.reason).toBeUndefined()

          // Test at exact limit (grace window - should allow)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(packLimit)
          const resultAtLimit = await UsageService.canCreatePack('test-user')
          expect(resultAtLimit.allowed).toBe(true)
          expect(resultAtLimit.reason).toBe('grace_window')
          expect(resultAtLimit.usage?.hasGraceWindow).toBe(true)

          // Test at limit + 1 (should block)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(packLimit + 1)
          const resultOverLimit = await UsageService.canCreatePack('test-user')
          expect(resultOverLimit.allowed).toBe(false)
          expect(resultOverLimit.reason).toBe('quota_exceeded')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Grace window flag is set correctly
   * Validates: Requirements 7.1, 7.2
   */
  test('Property 8: Grace window flag is set correctly in usage stats', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 5, max: 100 }), // pack limit
        fc.integer({ min: 0, max: 150 }), // current usage
        async (plan, packLimit, currentUsage) => {
          const mockUser = {
            id: 'test-user',
            authUserId: 'auth-user',
            email: 'test@example.com',
            plan,
            billingAnchor: 1,
            timezone: 'UTC',
            createdAt: new Date(),
          }

          const mockLimits = {
            plan,
            packsPerMonth: packLimit,
            cardsPerPack: 100,
            questionsPerQuiz: 20,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(currentUsage)

          const stats = await UsageService.getUsageStats('test-user')

          // Grace window flag should only be true when exactly at limit
          if (currentUsage === packLimit) {
            expect(stats.hasGraceWindow).toBe(true)
          } else {
            expect(stats.hasGraceWindow).toBe(false)
          }

          // Verify other stats are consistent
          expect(stats.currentUsage).toBe(currentUsage)
          expect(stats.limit).toBe(packLimit)
          expect(stats.remaining).toBe(packLimit - currentUsage)
          expect(stats.isAtLimit).toBe(currentUsage >= packLimit)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 9: Grace window behavior is consistent across plans
   * Validates: Requirements 7.1, 7.2, 7.3
   */
  test('Property 9: Grace window behavior is consistent across all plan tiers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 1, max: 300 }),
        async (plan, packLimit) => {
          const mockUser = {
            id: 'test-user',
            authUserId: 'auth-user',
            email: 'test@example.com',
            plan,
            billingAnchor: 1,
            timezone: 'UTC',
            createdAt: new Date(),
          }

          const mockLimits = {
            plan,
            packsPerMonth: packLimit,
            cardsPerPack: 100,
            questionsPerQuiz: 20,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)

          // Test grace window at exact limit
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(packLimit)
          const result = await UsageService.canCreatePack('test-user')

          // All plans should have grace window behavior
          expect(result.allowed).toBe(true)
          expect(result.reason).toBe('grace_window')
          expect(result.usage?.hasGraceWindow).toBe(true)
          expect(result.usage?.currentUsage).toBe(packLimit)
          expect(result.usage?.limit).toBe(packLimit)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 10: Grace window only allows one extra pack
   * Validates: Requirements 7.1, 7.3
   */
  test('Property 10: Grace window allows exactly one extra pack, no more', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 5, max: 100 }),
        async (plan, packLimit) => {
          const mockUser = {
            id: 'test-user',
            authUserId: 'auth-user',
            email: 'test@example.com',
            plan,
            billingAnchor: 1,
            timezone: 'UTC',
            createdAt: new Date(),
          }

          const mockLimits = {
            plan,
            packsPerMonth: packLimit,
            cardsPerPack: 100,
            questionsPerQuiz: 20,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)

          // Test multiple usage levels sequentially
          const usageLevels = [
            packLimit - 1, // Below limit
            packLimit,     // At limit (grace window)
            packLimit + 1, // Over limit
            packLimit + 2, // Way over limit
          ]

          const results = []
          for (const usage of usageLevels) {
            jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(usage)
            const result = await UsageService.canCreatePack('test-user')
            results.push(result)
          }

          // Below limit: allowed
          expect(results[0].allowed).toBe(true)
          expect(results[0].reason).toBeUndefined()

          // At limit: allowed (grace window)
          expect(results[1].allowed).toBe(true)
          expect(results[1].reason).toBe('grace_window')

          // Over limit: blocked
          expect(results[2].allowed).toBe(false)
          expect(results[2].reason).toBe('quota_exceeded')

          // Way over limit: blocked
          expect(results[3].allowed).toBe(false)
          expect(results[3].reason).toBe('quota_exceeded')
        }
      ),
      { numRuns: 100 }
    )
  })
})
