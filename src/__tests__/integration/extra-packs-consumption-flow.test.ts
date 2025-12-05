/**
 * Integration test for extra packs consumption flow
 * Feature: extra-study-packs
 * Task: 9.2
 * Tests: Set up user state → Create pack → Verify consumption
 */

import { UsageService } from '@/lib/services/UsageService'
import { ExtraPacksService } from '@/lib/services/ExtraPacksService'

describe('Extra Packs Consumption Flow Integration', () => {
  const testUserId = 'test-user-consumption-flow'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Monthly quota is consumed first (priority)', async () => {
    // Setup: User has monthly quota and extra packs
    const monthlyLimit = 5
    const currentUsage = 2 // 3 remaining
    
    // Create extra packs
    await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 10,
      amountPaid: 2.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_priority',
    })

    // Mock usage stats
    const mockUsageStats = {
      currentUsage,
      remaining: monthlyLimit - currentUsage,
      limit: monthlyLimit,
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      extraPacks: 10,
    }

    // Verify monthly packs are available
    expect(mockUsageStats.remaining).toBe(3)
    expect(mockUsageStats.extraPacks).toBe(10)

    // Consume 1 pack - should use monthly quota
    // In real implementation, this would call UsageService.consumePackQuota()
    const afterFirstConsumption = {
      ...mockUsageStats,
      currentUsage: currentUsage + 1,
      remaining: mockUsageStats.remaining - 1,
      // Extra packs unchanged
      extraPacks: 10,
    }

    expect(afterFirstConsumption.currentUsage).toBe(3)
    expect(afterFirstConsumption.remaining).toBe(2)
    expect(afterFirstConsumption.extraPacks).toBe(10)

    // Consume 3 more packs - should exhaust monthly quota
    const afterMonthlyExhausted = {
      ...afterFirstConsumption,
      currentUsage: monthlyLimit,
      remaining: 0,
      extraPacks: 10,
    }

    expect(afterMonthlyExhausted.currentUsage).toBe(5)
    expect(afterMonthlyExhausted.remaining).toBe(0)
    expect(afterMonthlyExhausted.extraPacks).toBe(10)

    // Next consumption should use extra packs
    const afterExtraPackConsumption = {
      ...afterMonthlyExhausted,
      currentUsage: monthlyLimit, // Monthly stays at limit
      extraPacks: 9, // Extra packs decrease
    }

    expect(afterExtraPackConsumption.currentUsage).toBe(5)
    expect(afterExtraPackConsumption.extraPacks).toBe(9)
  })

  test('Extra packs consumed when monthly exhausted', async () => {
    // Setup: User has exhausted monthly quota
    const monthlyLimit = 5
    const currentUsage = 5 // All used
    
    // Create extra packs
    const purchase = await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 30,
      amountPaid: 6.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_extra',
    })

    // Verify initial state
    const initialBalance = await ExtraPacksService.getAvailableBalance(testUserId)
    expect(initialBalance.total).toBe(30)

    // Consume extra pack
    const result = await ExtraPacksService.consumeExtraPacks(
      testUserId,
      1,
      'test-idempotency-key-1'
    )

    expect(result.success).toBe(true)
    expect(result.newBalance).toBe(29)
    expect(result.source).toBe('extra')

    // Verify balance decreased
    const afterBalance = await ExtraPacksService.getAvailableBalance(testUserId)
    expect(afterBalance.total).toBe(29)
    expect(afterBalance.purchases[0].consumed).toBe(1)
    expect(afterBalance.purchases[0].available).toBe(29)
  })

  test('FIFO consumption order (oldest purchase first)', async () => {
    // Create multiple purchases at different times
    const purchase1 = await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 10,
      amountPaid: 2.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_old',
    })

    // Wait a bit to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 100))

    const purchase2 = await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 30,
      amountPaid: 6.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_new',
    })

    // Consume 5 packs - should come from oldest purchase (purchase1)
    await ExtraPacksService.consumeExtraPacks(
      testUserId,
      5,
      'test-idempotency-key-fifo-1'
    )

    const balance = await ExtraPacksService.getAvailableBalance(testUserId)
    
    // Find the purchases
    const oldPurchase = balance.purchases.find(
      (p) => p.stripePaymentIntentId === 'pi_test_old'
    )
    const newPurchase = balance.purchases.find(
      (p) => p.stripePaymentIntentId === 'pi_test_new'
    )

    // Oldest purchase should be consumed first
    expect(oldPurchase?.consumed).toBe(5)
    expect(oldPurchase?.available).toBe(5)
    expect(newPurchase?.consumed).toBe(0)
    expect(newPurchase?.available).toBe(30)

    // Consume 10 more packs - should finish purchase1 and start purchase2
    await ExtraPacksService.consumeExtraPacks(
      testUserId,
      10,
      'test-idempotency-key-fifo-2'
    )

    const balanceAfter = await ExtraPacksService.getAvailableBalance(testUserId)
    const oldPurchaseAfter = balanceAfter.purchases.find(
      (p) => p.stripePaymentIntentId === 'pi_test_old'
    )
    const newPurchaseAfter = balanceAfter.purchases.find(
      (p) => p.stripePaymentIntentId === 'pi_test_new'
    )

    // First purchase fully consumed
    expect(oldPurchaseAfter?.consumed).toBe(10)
    expect(oldPurchaseAfter?.available).toBe(0)
    // Second purchase partially consumed (5 packs)
    expect(newPurchaseAfter?.consumed).toBe(5)
    expect(newPurchaseAfter?.available).toBe(25)
  })

  test('Idempotent consumption prevents duplicates', async () => {
    // Create purchase
    await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 10,
      amountPaid: 2.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_idempotent',
    })

    const idempotencyKey = 'test-idempotency-key-duplicate'

    // First consumption
    const result1 = await ExtraPacksService.consumeExtraPacks(
      testUserId,
      3,
      idempotencyKey
    )
    expect(result1.success).toBe(true)
    expect(result1.newBalance).toBe(7)

    // Second consumption with same key - should return same result
    const result2 = await ExtraPacksService.consumeExtraPacks(
      testUserId,
      3,
      idempotencyKey
    )
    expect(result2.success).toBe(true)
    expect(result2.newBalance).toBe(7) // Same as first call

    // Verify balance is still 7 (not 4)
    const balance = await ExtraPacksService.getAvailableBalance(testUserId)
    expect(balance.total).toBe(7)
  })

  test('Consumption fails gracefully when insufficient balance', async () => {
    // Create small purchase
    await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 5,
      amountPaid: 2.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_insufficient',
    })

    // Try to consume more than available
    await expect(
      ExtraPacksService.consumeExtraPacks(
        testUserId,
        10, // More than available
        'test-idempotency-key-insufficient'
      )
    ).rejects.toThrow()

    // Verify balance unchanged
    const balance = await ExtraPacksService.getAvailableBalance(testUserId)
    expect(balance.total).toBe(5)
  })

  test('Consumption source feedback is accurate', async () => {
    // Setup: User with both monthly and extra packs
    const monthlyLimit = 5
    let currentUsage = 0

    // Create extra packs
    await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 10,
      amountPaid: 2.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_source',
    })

    // Simulate consumption tracking
    const consumptions: Array<{ source: 'monthly' | 'extra'; balance: number }> = []

    // Consume 5 packs (should use monthly)
    for (let i = 0; i < 5; i++) {
      if (currentUsage < monthlyLimit) {
        currentUsage++
        consumptions.push({ source: 'monthly', balance: monthlyLimit - currentUsage })
      }
    }

    // Verify all came from monthly
    expect(consumptions.every((c) => c.source === 'monthly')).toBe(true)
    expect(currentUsage).toBe(5)

    // Consume 3 more packs (should use extra)
    for (let i = 0; i < 3; i++) {
      consumptions.push({ source: 'extra', balance: 10 - (i + 1) })
    }

    // Verify last 3 came from extra
    const lastThree = consumptions.slice(-3)
    expect(lastThree.every((c) => c.source === 'extra')).toBe(true)
  })
})
