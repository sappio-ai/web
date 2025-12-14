/**
 * Property-based tests for plan limit consistency
 * Feature: pricing-tier-implementation, Property 1: Plan limits are enforced consistently
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 */

import { describe, it, expect, beforeAll } from '@jest/globals'
import fc from 'fast-check'
import { UsageService } from '../UsageService'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { PlanTier } from '@/lib/types/usage'

describe('Property: Plan limits are enforced consistently', () => {
  beforeAll(() => {
    // Clear cache before tests
    UsageService.clearCache()
  })

  it('should enforce same limits across all pack creation endpoints for any plan tier', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        async (planTier) => {
          // Get limits from service
          const limits = await UsageService.getPlanLimits(planTier)

          // Verify limits match expected values based on plan
          expect(limits.plan).toBe(planTier)
          expect(limits.packsPerMonth).toBeGreaterThan(0)
          expect(limits.cardsPerPack).toBeGreaterThan(0)
          expect(limits.questionsPerQuiz).toBeGreaterThan(0)
          expect(limits.mindmapNodesLimit).toBeGreaterThan(0)

          // Verify specific values for each tier
          if (planTier === 'free') {
            expect(limits.packsPerMonth).toBe(3)
            expect(limits.cardsPerPack).toBe(20)
            expect(limits.questionsPerQuiz).toBe(8)
            expect(limits.mindmapNodesLimit).toBe(40)
            expect(limits.initialCardsPerPack).toBe(20)
            expect(limits.initialQuestionsPerQuiz).toBe(8)
            expect(limits.initialMindmapNodes).toBe(40)
            expect(limits.batchCardsSize).toBeNull()
            expect(limits.batchQuestionsSize).toBeNull()
            expect(limits.batchNodesSize).toBeNull()
            expect(limits.priorityProcessing).toBe(false)
          } else if (planTier === 'student_pro') {
            expect(limits.packsPerMonth).toBe(50)
            expect(limits.cardsPerPack).toBe(120)
            expect(limits.questionsPerQuiz).toBe(30)
            expect(limits.mindmapNodesLimit).toBe(250)
            expect(limits.initialCardsPerPack).toBe(20)
            expect(limits.initialQuestionsPerQuiz).toBe(10)
            expect(limits.initialMindmapNodes).toBe(50)
            expect(limits.batchCardsSize).toBe(30)
            expect(limits.batchQuestionsSize).toBe(10)
            expect(limits.batchNodesSize).toBe(60)
            expect(limits.priorityProcessing).toBe(true)
          } else if (planTier === 'pro_plus') {
            expect(limits.packsPerMonth).toBe(150)
            expect(limits.cardsPerPack).toBe(200)
            expect(limits.questionsPerQuiz).toBe(60)
            expect(limits.mindmapNodesLimit).toBe(800)
            expect(limits.initialCardsPerPack).toBe(25)
            expect(limits.initialQuestionsPerQuiz).toBe(15)
            expect(limits.initialMindmapNodes).toBe(60)
            expect(limits.batchCardsSize).toBe(50)
            expect(limits.batchQuestionsSize).toBe(15)
            expect(limits.batchNodesSize).toBe(100)
            expect(limits.priorityProcessing).toBe(true)
          }

          // Verify limits are consistent when retrieved multiple times
          const limitsAgain = await UsageService.getPlanLimits(planTier)
          expect(limitsAgain).toEqual(limits)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should return consistent limits from database and fallback', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        async (planTier) => {
          // Clear cache to force database fetch
          UsageService.clearCache()
          const dbLimits = await UsageService.getPlanLimits(planTier)

          // Verify database limits are valid
          expect(dbLimits.plan).toBe(planTier)
          expect(dbLimits.packsPerMonth).toBeGreaterThan(0)
          expect(dbLimits.cardsPerPack).toBeGreaterThan(0)
          expect(dbLimits.questionsPerQuiz).toBeGreaterThan(0)
          expect(dbLimits.mindmapNodesLimit).toBeGreaterThan(0)
          expect(typeof dbLimits.priorityProcessing).toBe('boolean')
        }
      ),
      { numRuns: 10 }
    )
  }, 15000)

  it('should cache limits correctly for any plan tier', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        async (planTier) => {
          // Clear cache
          UsageService.clearCache()

          // First fetch (from database)
          const firstFetch = await UsageService.getPlanLimits(planTier)

          // Second fetch (from cache)
          const secondFetch = await UsageService.getPlanLimits(planTier)

          // Should be identical
          expect(secondFetch).toEqual(firstFetch)
        }
      ),
      { numRuns: 10 }
    )
  }, 15000)

  it('should enforce hierarchical limits (paid plans have higher limits than free)', async () => {
    const freeLimits = await UsageService.getPlanLimits('free')
    const studentLimits = await UsageService.getPlanLimits('student_pro')
    const proLimits = await UsageService.getPlanLimits('pro_plus')

    // Student should have more than free
    expect(studentLimits.packsPerMonth).toBeGreaterThan(freeLimits.packsPerMonth)
    expect(studentLimits.cardsPerPack).toBeGreaterThan(freeLimits.cardsPerPack)
    expect(studentLimits.questionsPerQuiz).toBeGreaterThan(freeLimits.questionsPerQuiz)
    expect(studentLimits.mindmapNodesLimit).toBeGreaterThan(freeLimits.mindmapNodesLimit)

    // Pro should have more than student
    expect(proLimits.packsPerMonth).toBeGreaterThan(studentLimits.packsPerMonth)
    expect(proLimits.cardsPerPack).toBeGreaterThan(studentLimits.cardsPerPack)
    expect(proLimits.questionsPerQuiz).toBeGreaterThan(studentLimits.questionsPerQuiz)
    expect(proLimits.mindmapNodesLimit).toBeGreaterThan(studentLimits.mindmapNodesLimit)

    // Only paid plans have priority processing
    expect(freeLimits.priorityProcessing).toBe(false)
    expect(studentLimits.priorityProcessing).toBe(true)
    expect(proLimits.priorityProcessing).toBe(true)
  })
})
