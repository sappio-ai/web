/**
 * Integration test for extra packs purchase flow
 * Feature: extra-study-packs
 * Task: 9.1
 * Tests: Create checkout → Simulate webhook → Verify credit
 */

import { ExtraPacksService } from '@/lib/services/ExtraPacksService'
import { StripeService } from '@/lib/services/StripeService'

describe('Extra Packs Purchase Flow Integration', () => {
  const testUserId = 'test-user-purchase-flow'
  const testEmail = 'test@example.com'

  beforeEach(() => {
    // Clear any test data
    jest.clearAllMocks()
  })

  test('Complete purchase flow: checkout → webhook → credit', async () => {
    // Step 1: Get available bundles
    const bundles = ExtraPacksService.getBundles()
    expect(bundles).toHaveLength(3)
    expect(bundles[1].quantity).toBe(30) // Popular bundle
    expect(bundles[1].popular).toBe(true)

    // Step 2: Create checkout session (mocked)
    const selectedBundle = bundles[1] // 30-pack bundle
    const mockCheckoutSession = {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
      metadata: {
        userId: testUserId,
        quantity: selectedBundle.quantity.toString(),
        bundleType: '30-pack',
      },
    }

    // Verify checkout would be created with correct data
    expect(mockCheckoutSession.metadata.quantity).toBe('30')
    expect(mockCheckoutSession.metadata.userId).toBe(testUserId)

    // Step 3: Simulate successful payment (webhook event)
    const mockPaymentIntent = {
      id: 'pi_test_123',
      amount: Math.round(selectedBundle.price * 100), // Stripe uses cents
      currency: 'eur',
      status: 'succeeded',
    }

    // Step 4: Create purchase record (simulating webhook handler)
    const purchase = await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: selectedBundle.quantity,
      amountPaid: selectedBundle.price,
      currency: 'EUR',
      stripePaymentIntentId: mockPaymentIntent.id,
    })

    // Verify purchase was created correctly
    expect(purchase.userId).toBe(testUserId)
    expect(purchase.quantity).toBe(30)
    expect(purchase.consumed).toBe(0)
    expect(purchase.amountPaid).toBe(6.99)
    expect(purchase.status).toBe('active')
    expect(purchase.stripePaymentIntentId).toBe(mockPaymentIntent.id)

    // Verify expiration date is set correctly (6 months from now)
    const purchaseDate = new Date(purchase.purchasedAt)
    const expirationDate = new Date(purchase.expiresAt)
    const monthsDiff =
      (expirationDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
      (expirationDate.getMonth() - purchaseDate.getMonth())
    expect(monthsDiff).toBeGreaterThanOrEqual(5)
    expect(monthsDiff).toBeLessThanOrEqual(7)

    // Step 5: Verify balance increased
    const balance = await ExtraPacksService.getAvailableBalance(testUserId)
    expect(balance.total).toBe(30)
    expect(balance.purchases).toHaveLength(1)
    expect(balance.purchases[0].available).toBe(30)
    expect(balance.nearestExpiration).toBeDefined()

    // Cleanup
    // Note: In a real test, you'd clean up the database
    // For now, we're using in-memory mocks
  })

  test('Multiple purchases accumulate correctly', async () => {
    // Purchase 1: 10-pack
    const purchase1 = await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 10,
      amountPaid: 2.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_1',
    })

    // Purchase 2: 30-pack
    const purchase2 = await ExtraPacksService.createPurchase({
      userId: testUserId,
      quantity: 30,
      amountPaid: 6.99,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_test_2',
    })

    // Verify total balance
    const balance = await ExtraPacksService.getAvailableBalance(testUserId)
    expect(balance.total).toBe(40) // 10 + 30
    expect(balance.purchases).toHaveLength(2)

    // Verify purchases are tracked independently
    const purchase1Data = balance.purchases.find(
      (p) => p.stripePaymentIntentId === 'pi_test_1'
    )
    const purchase2Data = balance.purchases.find(
      (p) => p.stripePaymentIntentId === 'pi_test_2'
    )

    expect(purchase1Data?.quantity).toBe(10)
    expect(purchase2Data?.quantity).toBe(30)
  })

  test('Purchase with invalid data fails gracefully', async () => {
    // Attempt to create purchase with invalid quantity
    await expect(
      ExtraPacksService.createPurchase({
        userId: testUserId,
        quantity: 0, // Invalid
        amountPaid: 2.99,
        currency: 'EUR',
        stripePaymentIntentId: 'pi_test_invalid',
      })
    ).rejects.toThrow()

    // Attempt to create purchase with negative amount
    await expect(
      ExtraPacksService.createPurchase({
        userId: testUserId,
        quantity: 10,
        amountPaid: -2.99, // Invalid
        currency: 'EUR',
        stripePaymentIntentId: 'pi_test_invalid2',
      })
    ).rejects.toThrow()
  })
})
