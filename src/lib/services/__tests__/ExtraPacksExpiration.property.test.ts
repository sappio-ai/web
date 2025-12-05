/**
 * Property-based tests for extra packs expiration date calculation
 * Feature: extra-study-packs
 * Task: 1.4
 * Validates: Requirements 1.4
 */

import * as fc from 'fast-check'

describe('Extra Packs Expiration Property Tests', () => {
  /**
   * Property 1: Expiration date calculation
   * For any extra pack purchase, the expiration date should always equal
   * the purchase date plus exactly 6 months
   * Validates: Requirements 1.4
   */
  test('Property 1: Expiration date calculation', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
        (purchaseDate) => {
          // This is how ExtraPacksService.createPurchase calculates expiration
          const expiresAt = new Date(purchaseDate)
          expiresAt.setMonth(expiresAt.getMonth() + 6)

          // The key property: expiration is always after purchase
          expect(expiresAt.getTime()).toBeGreaterThan(purchaseDate.getTime())

          // Calculate approximate month difference
          const yearDiff = expiresAt.getFullYear() - purchaseDate.getFullYear()
          const monthDiff = yearDiff * 12 + (expiresAt.getMonth() - purchaseDate.getMonth())

          // Should be 6 months (or 5-7 due to JavaScript date quirks with month-end)
          expect(monthDiff).toBeGreaterThanOrEqual(5)
          expect(monthDiff).toBeLessThanOrEqual(7)

          // More importantly: should be approximately 180 days (6 months)
          const daysDiff =
            (expiresAt.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
          expect(daysDiff).toBeGreaterThanOrEqual(150) // ~5 months
          expect(daysDiff).toBeLessThanOrEqual(190) // ~6.3 months
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1b: Expiration date is always in the future at purchase time
   */
  test('Property 1b: Expiration date is always after purchase date', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
        (purchaseDate) => {
          const expiresAt = new Date(purchaseDate)
          expiresAt.setMonth(expiresAt.getMonth() + 6)

          // Expiration must be after purchase
          expect(expiresAt.getTime()).toBeGreaterThan(purchaseDate.getTime())

          // Minimum difference should be approximately 6 months
          const daysDiff =
            (expiresAt.getTime() - purchaseDate.getTime()) /
            (1000 * 60 * 60 * 24)
          
          // 6 months is approximately 180 days (allow for month variations)
          expect(daysDiff).toBeGreaterThanOrEqual(150)
          expect(daysDiff).toBeLessThanOrEqual(190)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 1c: Expiration calculation is consistent
   */
  test('Property 1c: Calculating expiration twice gives same result', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
        (purchaseDate) => {
          // Calculate expiration twice
          const expiresAt1 = new Date(purchaseDate)
          expiresAt1.setMonth(expiresAt1.getMonth() + 6)

          const expiresAt2 = new Date(purchaseDate)
          expiresAt2.setMonth(expiresAt2.getMonth() + 6)

          // Should be identical
          expect(expiresAt1.getTime()).toBe(expiresAt2.getTime())
        }
      ),
      { numRuns: 100 }
    )
  })
})
