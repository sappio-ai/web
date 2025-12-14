/**
 * Property-based tests for UsageService extra packs integration
 * Feature: extra-study-packs
 * Tasks: 3.2, 3.3, 3.5, 3.6, 3.8, 3.9
 */

import * as fc from 'fast-check'
import { UsageService } from '../UsageService'
import { ExtraPacksService } from '../ExtraPacksService'
import type { PlanTier } from '@/lib/types/usage'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn(),
}))

// Mock ExtraPacksService
jest.mock('../ExtraPacksService')

describe('UsageService Extra Packs Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Property 3: Monthly quota priority
   * For any quota check when monthly quota is available, the system should
   * allow pack creation and consume from monthly quota before considering extra packs
   * Validates: Requirements 2.1, 2.2
   */
  test('Property 3: Monthly quota priority', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 5, max: 300 }), // pack limit
        fc.integer({ min: 0, max: 100 }), // current usage (below limit)
        fc.integer({ min: 0, max: 100 }), // extra packs available
        async (plan, packLimit, currentUsage, extraPacks) => {
          // Ensure current usage is below limit
          const usage = Math.min(currentUsage, packLimit - 1)

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
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(usage)

          // Mock extra packs available
          ;(ExtraPacksService.getAvailableBalance as jest.Mock).mockResolvedValue({
            total: extraPacks,
            purchases: [],
            nearestExpiration: undefined,
          })

          const result = await UsageService.canCreatePack('test-user')

          // Should allow creation
          expect(result.allowed).toBe(true)

          // Should indicate monthly consumption
          expect(result.consumptionSource).toBe('monthly')

          // Usage stats should show both monthly and extra packs
          expect(result.usage?.extraPacksAvailable).toBe(extraPacks)
          expect(result.usage?.totalAvailable).toBe(packLimit - usage + extraPacks)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 4: Extra pack consumption order
   * For any quota check when monthly quota is exhausted and extra packs are available,
   * the system should allow pack creation and consume from extra packs
   * Validates: Requirements 2.3
   */
  test('Property 4: Extra pack consumption order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 5, max: 300 }), // pack limit
        fc.integer({ min: 1, max: 100 }), // extra packs available
        async (plan, packLimit, extraPacks) => {
          // User is over limit (exhausted monthly + grace)
          const usage = packLimit + 1

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
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(usage)

          // Mock extra packs available
          ;(ExtraPacksService.getAvailableBalance as jest.Mock).mockResolvedValue({
            total: extraPacks,
            purchases: [],
            nearestExpiration: undefined,
          })

          const result = await UsageService.canCreatePack('test-user')

          // Should allow creation from extra packs
          expect(result.allowed).toBe(true)
          expect(result.consumptionSource).toBe('extra')

          // Usage stats should show extra packs
          expect(result.usage?.extraPacksAvailable).toBe(extraPacks)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 5: Period boundary preservation
   * For any billing period transition, monthly usage should reset to zero
   * while extra pack balances remain unchanged
   * Validates: Requirements 2.5, 3.1
   */
  test('Property 5: Period boundary preservation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 5, max: 300 }),
        fc.integer({ min: 0, max: 100 }),
        async (plan, packLimit, extraPacks) => {
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
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)

          // Simulate new period (usage resets to 0)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(0)

          // Extra packs remain the same
          ;(ExtraPacksService.getAvailableBalance as jest.Mock).mockResolvedValue({
            total: extraPacks,
            purchases: [],
            nearestExpiration: undefined,
          })

          const stats = await UsageService.getUsageStats('test-user')

          // Monthly usage should be 0 (reset)
          expect(stats.currentUsage).toBe(0)
          expect(stats.remaining).toBe(packLimit)

          // Extra packs should remain unchanged
          expect(stats.extraPacksAvailable).toBe(extraPacks)

          // Total available should be full monthly + extra packs
          expect(stats.totalAvailable).toBe(packLimit + extraPacks)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 9: Expiration warning threshold
   * For any user with packs expiring within 30 days, the system should
   * display a warning with the expiration date
   * Validates: Requirements 3.5
   */
  test('Property 9: Expiration warning threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -10, max: 60 }), // days until expiration
        fc.integer({ min: 1, max: 100 }), // pack count
        async (daysUntilExpiration, packCount) => {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + daysUntilExpiration)

          ;(ExtraPacksService.getAvailableBalance as jest.Mock).mockResolvedValue({
            total: packCount,
            purchases: [],
            nearestExpiration: expiresAt,
          })

          const warning = await UsageService.getExpirationWarning('test-user')

          if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
            // Should show warning (positive days only, not expired)
            expect(warning.hasWarning).toBe(true)
            expect(warning.count).toBe(packCount)
            expect(warning.expiresAt).toEqual(expiresAt)
            expect(warning.daysRemaining).toBeLessThanOrEqual(30)
            expect(warning.daysRemaining).toBeGreaterThan(0)
          } else {
            // Should not show warning (expired or too far in future)
            expect(warning.hasWarning).toBe(false)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 16: Consumption source feedback
   * For any successful pack creation, the response should indicate whether
   * the pack was consumed from monthly quota or extra packs
   * Validates: Requirements 7.4
   */
  test('Property 16: Consumption source feedback', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 5, max: 300 }),
        fc.integer({ min: 0, max: 400 }), // current usage
        fc.integer({ min: 0, max: 100 }), // extra packs
        async (plan, packLimit, currentUsage, extraPacks) => {
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
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(currentUsage)

          ;(ExtraPacksService.getAvailableBalance as jest.Mock).mockResolvedValue({
            total: extraPacks,
            purchases: [],
            nearestExpiration: undefined,
          })

          const mockRpc = jest.fn().mockResolvedValue({
            data: currentUsage + 1,
            error: null,
          })
          ;(createServiceRoleClient as jest.Mock).mockReturnValue({ rpc: mockRpc })

          ;(ExtraPacksService.consumeExtraPacks as jest.Mock).mockResolvedValue({
            success: true,
            newBalance: extraPacks - 1,
          })

          const result = await UsageService.consumePackQuota('test-user', 'test-key')

          // Should indicate source
          expect(result.source).toBeDefined()
          expect(['monthly', 'extra']).toContain(result.source)

          // If monthly quota available (including grace), should use monthly
          if (currentUsage <= packLimit) {
            expect(result.source).toBe('monthly')
          } else if (extraPacks > 0) {
            // Otherwise, if extra packs available, should use extra
            expect(result.source).toBe('extra')
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 18: Unified availability response
   * For any availability check, the response should include monthly remaining,
   * extra packs available, and total available as separate fields
   * Validates: Requirements 8.4
   */
  test('Property 18: Unified availability response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        fc.integer({ min: 5, max: 300 }),
        fc.integer({ min: 0, max: 300 }),
        fc.integer({ min: 0, max: 100 }),
        async (plan, packLimit, currentUsage, extraPacks) => {
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
            maxPagesPerMaterial: 50,
            maxTokensPerMaterial: 100000,
            mindmapNodesLimit: 200,
            initialCardsPerPack: 20,
            initialQuestionsPerQuiz: 10,
            initialMindmapNodes: 50,
            batchCardsSize: plan !== 'free' ? 30 : null,
            batchQuestionsSize: plan !== 'free' ? 10 : null,
            batchNodesSize: plan !== 'free' ? 60 : null,
            priorityProcessing: plan !== 'free',
          }

          jest.spyOn(UsageService, 'getUserProfile').mockResolvedValue(mockUser)
          jest.spyOn(UsageService, 'getPlanLimits').mockResolvedValue(mockLimits)
          jest.spyOn(UsageService, 'getUsageForPeriod').mockResolvedValue(currentUsage)

          ;(ExtraPacksService.getAvailableBalance as jest.Mock).mockResolvedValue({
            total: extraPacks,
            purchases: [],
            nearestExpiration: undefined,
          })

          const stats = await UsageService.getUsageStats('test-user')

          // Should have all three fields
          expect(stats.remaining).toBeDefined()
          expect(stats.extraPacksAvailable).toBeDefined()
          expect(stats.totalAvailable).toBeDefined()

          // Verify calculations
          // Note: remaining can be negative if over limit (before grace window)
          const expectedRemaining = packLimit - currentUsage
          expect(stats.remaining).toBe(expectedRemaining)
          expect(stats.extraPacksAvailable).toBe(extraPacks)
          // Total available should never be negative
          const expectedTotal = Math.max(0, expectedRemaining) + extraPacks
          expect(stats.totalAvailable).toBe(expectedTotal)
        }
      ),
      { numRuns: 50 }
    )
  })
})
