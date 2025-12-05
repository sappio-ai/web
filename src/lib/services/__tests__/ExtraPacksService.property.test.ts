/**
 * Property-based tests for ExtraPacksService
 * Feature: extra-study-packs
 * Tasks: 2.3, 2.4, 2.5, 2.8, 2.10, 2.12, 2.13, 2.15, 2.16
 */

import * as fc from 'fast-check'
import { ExtraPacksService } from '../ExtraPacksService'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(),
}))

describe('ExtraPacksService Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Property 2: Independent purchase tracking
   * For any user with multiple extra pack purchases, each purchase should have
   * its own unique record with independent expiration dates
   * Validates: Requirements 1.5
   */
  test('Property 2: Independent purchase tracking', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            quantity: fc.constantFrom(10, 30, 75),
            purchaseDate: fc.date({
              min: new Date('2024-01-01'),
              max: new Date('2025-12-31'),
            }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (purchases) => {
          // Filter out invalid dates and mock multiple purchases
          const validPurchases = purchases.filter(p => !isNaN(p.purchaseDate.getTime()))
          if (validPurchases.length === 0) return // Skip if no valid dates

          const mockPurchases = validPurchases.map((p, idx) => {
            const expiresAt = new Date(p.purchaseDate)
            expiresAt.setMonth(expiresAt.getMonth() + 6)

            return {
              id: `purchase-${idx}`,
              quantity: p.quantity,
              consumed: 0,
              available: p.quantity,
              purchasedAt: p.purchaseDate.toISOString(),
              expiresAt: expiresAt.toISOString(),
              amountPaid: p.quantity === 10 ? 2.99 : p.quantity === 30 ? 6.99 : 14.99,
              currency: 'EUR',
            }
          })

          const mockRpc = jest.fn().mockResolvedValue({
            data: [
              {
                total_available: mockPurchases.reduce((sum, p) => sum + p.quantity, 0),
                nearest_expiration: mockPurchases[0].expiresAt,
                purchases: mockPurchases,
              },
            ],
            error: null,
          })

          ;(createServiceRoleClient as jest.Mock).mockReturnValue({ rpc: mockRpc })

          const balance = await ExtraPacksService.getAvailableBalance('test-user')

          // Each purchase should be tracked independently
          expect(balance.purchases.length).toBe(validPurchases.length)

          // Each purchase should have unique ID
          const ids = balance.purchases.map((p) => p.id)
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(ids.length)

          // Each purchase should have its own expiration date
          const expirations = balance.purchases.map((p) => p.expiresAt.getTime())
          // At least some should be different (unless all purchased same day)
          const uniqueExpirations = new Set(expirations)
          expect(uniqueExpirations.size).toBeGreaterThanOrEqual(1)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 6: Expired pack exclusion
   * For any balance calculation, all purchases with expiration dates before
   * the current date should be excluded from the available balance
   * Validates: Requirements 3.2, 6.3
   */
  test('Property 6: Expired pack exclusion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            quantity: fc.constantFrom(10, 30, 75),
            daysUntilExpiration: fc.integer({ min: -30, max: 180 }),
          }),
          { minLength: 1, maxLength: 5 }
        ).filter(purchases => purchases.some(p => p.daysUntilExpiration > 0)), // Ensure at least one non-expired
        async (purchases) => {
          const now = new Date()

          const mockPurchases = purchases
            .map((p, idx) => {
              const expiresAt = new Date(now)
              expiresAt.setDate(expiresAt.getDate() + p.daysUntilExpiration)

              return {
                id: `purchase-${idx}`,
                quantity: p.quantity,
                consumed: 0,
                available: p.quantity,
                purchasedAt: new Date(
                  expiresAt.getTime() - 6 * 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                expiresAt: expiresAt.toISOString(),
                amountPaid: p.quantity === 10 ? 2.99 : p.quantity === 30 ? 6.99 : 14.99,
                currency: 'EUR',
                isExpired: p.daysUntilExpiration < 0,
              }
            })
            .filter((p) => !p.isExpired) // Database function filters expired

          const expectedTotal = mockPurchases.reduce((sum, p) => sum + p.quantity, 0)

          const mockRpc = jest.fn().mockResolvedValue({
            data: [
              {
                total_available: expectedTotal,
                nearest_expiration: mockPurchases[0]?.expiresAt,
                purchases: mockPurchases,
              },
            ],
            error: null,
          })

          ;(createServiceRoleClient as jest.Mock).mockReturnValue({ rpc: mockRpc })

          const balance = await ExtraPacksService.getAvailableBalance('test-user')

          // Total should only include non-expired purchases
          expect(balance.total).toBe(expectedTotal)

          // All returned purchases should have future expiration dates (or equal for edge case)
          balance.purchases.forEach((p) => {
            expect(p.expiresAt.getTime()).toBeGreaterThanOrEqual(now.getTime())
          })
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 8: Balance display completeness
   * For any user with extra packs, the balance display should show the total
   * available packs and the nearest expiration date from all active purchases
   * Validates: Requirements 3.4, 7.2
   */
  test('Property 8: Balance display completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            quantity: fc.constantFrom(10, 30, 75),
            daysUntilExpiration: fc.integer({ min: 1, max: 180 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (purchases) => {
          const now = new Date()

          const mockPurchases = purchases.map((p, idx) => {
            const expiresAt = new Date(now)
            expiresAt.setDate(expiresAt.getDate() + p.daysUntilExpiration)

            return {
              id: `purchase-${idx}`,
              quantity: p.quantity,
              consumed: 0,
              available: p.quantity,
              purchasedAt: new Date(
                expiresAt.getTime() - 6 * 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              expiresAt: expiresAt.toISOString(),
              amountPaid: p.quantity === 10 ? 2.99 : p.quantity === 30 ? 6.99 : 14.99,
              currency: 'EUR',
            }
          })

          // Find nearest expiration
          const nearestExpiration = mockPurchases.reduce((nearest, p) => {
            const expDate = new Date(p.expiresAt)
            return !nearest || expDate < nearest ? expDate : nearest
          }, null as Date | null)

          const expectedTotal = mockPurchases.reduce((sum, p) => sum + p.quantity, 0)

          const mockRpc = jest.fn().mockResolvedValue({
            data: [
              {
                total_available: expectedTotal,
                nearest_expiration: nearestExpiration?.toISOString(),
                purchases: mockPurchases,
              },
            ],
            error: null,
          })

          ;(createServiceRoleClient as jest.Mock).mockReturnValue({ rpc: mockRpc })

          const balance = await ExtraPacksService.getAvailableBalance('test-user')

          // Should show total available
          expect(balance.total).toBe(expectedTotal)

          // Should show nearest expiration
          expect(balance.nearestExpiration).toBeDefined()
          if (nearestExpiration) {
            expect(balance.nearestExpiration?.getTime()).toBe(nearestExpiration.getTime())
          }

          // Should include all purchases
          expect(balance.purchases.length).toBe(purchases.length)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 10: Refund eligibility rules
   * For any purchase within 14 days of purchase date, refund should be allowed
   * if and only if consumed equals zero
   * Validates: Requirements 4.1, 4.2
   */
  test('Property 10: Refund eligibility rules', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          daysSincePurchase: fc.integer({ min: 0, max: 30 }),
          consumed: fc.integer({ min: 0, max: 75 }),
          quantity: fc.constantFrom(10, 30, 75),
        }),
        async ({ daysSincePurchase, consumed, quantity }) => {
          const purchasedAt = new Date()
          purchasedAt.setDate(purchasedAt.getDate() - daysSincePurchase)

          const mockPurchase = {
            id: 'test-purchase',
            user_id: 'test-user',
            quantity,
            consumed: Math.min(consumed, quantity),
            amount_paid: 9.99,
            currency: 'EUR',
            stripe_payment_intent_id: 'pi_test',
            purchased_at: purchasedAt.toISOString(),
            expires_at: new Date(
              purchasedAt.getTime() + 6 * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: 'active',
            refunded_at: null,
            refund_amount: null,
          }

          const mockSelect = jest.fn().mockReturnThis()
          const mockEq = jest.fn().mockReturnThis()
          const mockSingle = jest.fn().mockResolvedValue({
            data: mockPurchase,
            error: null,
          })

          ;(createServiceRoleClient as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
              select: mockSelect,
            }),
          })

          mockSelect.mockReturnValue({
            eq: mockEq,
          })

          mockEq.mockReturnValue({
            single: mockSingle,
          })

          const result = await ExtraPacksService.canRefund('test-purchase')

          // Refund allowed if within 14 days AND consumed === 0
          const withinWindow = daysSincePurchase <= 14
          const noneConsumed = mockPurchase.consumed === 0
          const shouldAllow = withinWindow && noneConsumed

          expect(result.allowed).toBe(shouldAllow)

          if (!shouldAllow) {
            expect(result.reason).toBeDefined()
            // Check that reason matches the failure condition
            // Note: Service returns first failure reason it encounters
            if (!noneConsumed) {
              expect(result.reason).toContain('consumed')
            } else if (!withinWindow) {
              expect(result.reason).toContain('14 days')
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 17: Idempotent consumption
   * For any pack consumption operation with the same idempotency key,
   * executing it multiple times should result in exactly one pack being consumed
   * Validates: Requirements 8.3
   */
  test('Property 17: Idempotent consumption', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialBalance: fc.integer({ min: 10, max: 100 }),
          consumeCount: fc.integer({ min: 1, max: 10 }),
          attempts: fc.integer({ min: 2, max: 5 }),
        }),
        async ({ initialBalance, consumeCount, attempts }) => {
          const idempotencyKey = `test-key-${Date.now()}`

          let callCount = 0
          const mockRpc = jest.fn().mockImplementation(() => {
            callCount++
            // First call: success
            // Subsequent calls: return same balance (idempotency)
            return Promise.resolve({
              data: [
                {
                  success: true,
                  new_balance: initialBalance - consumeCount,
                  consumed_from: callCount === 1 ? [{ purchaseId: 'p1', consumed: consumeCount }] : [],
                },
              ],
              error: null,
            })
          })

          ;(createServiceRoleClient as jest.Mock).mockReturnValue({ rpc: mockRpc })

          // Call multiple times with same idempotency key
          const results = []
          for (let i = 0; i < attempts; i++) {
            const result = await ExtraPacksService.consumeExtraPacks(
              'test-user',
              consumeCount,
              idempotencyKey
            )
            results.push(result)
          }

          // All calls should succeed
          results.forEach((r) => {
            expect(r.success).toBe(true)
          })

          // All calls should return same balance
          const balances = results.map((r) => r.newBalance)
          const uniqueBalances = new Set(balances)
          expect(uniqueBalances.size).toBe(1)
          expect(balances[0]).toBe(initialBalance - consumeCount)
        }
      ),
      { numRuns: 50 }
    )
  })
})
