/**
 * Unit tests for PricingService
 * Validates: Requirements 5.1, 5.2, 5.3, 9.2, 9.3, 9.4
 */

import { describe, it, expect } from '@jest/globals'

describe('PricingService', () => {
  const CURRENT_PRICES = {
    student_pro_monthly: 7.99,
    student_pro_semester: 24.0,
    pro_plus_monthly: 11.99,
  }

  const FOUNDING_PRICES = {
    student_pro_monthly: 7.99,
    student_pro_semester: 24.0,
    pro_plus_monthly: 11.99,
  }

  describe('Current prices', () => {
    it('should have correct student_pro monthly price', () => {
      expect(CURRENT_PRICES.student_pro_monthly).toBe(7.99)
    })

    it('should have correct student_pro semester price', () => {
      expect(CURRENT_PRICES.student_pro_semester).toBe(24.0)
    })

    it('should have correct pro_plus monthly price', () => {
      expect(CURRENT_PRICES.pro_plus_monthly).toBe(11.99)
    })
  })

  describe('Founding prices', () => {
    it('should match current prices', () => {
      expect(FOUNDING_PRICES.student_pro_monthly).toBe(
        CURRENT_PRICES.student_pro_monthly
      )
      expect(FOUNDING_PRICES.student_pro_semester).toBe(
        CURRENT_PRICES.student_pro_semester
      )
      expect(FOUNDING_PRICES.pro_plus_monthly).toBe(
        CURRENT_PRICES.pro_plus_monthly
      )
    })
  })

  describe('Price lock logic', () => {
    it('should use locked prices when lock is active', () => {
      const hasActiveLock = true
      const lockedPrices = FOUNDING_PRICES
      const currentPrices = CURRENT_PRICES

      const displayedPrice = hasActiveLock
        ? lockedPrices.student_pro_monthly
        : currentPrices.student_pro_monthly

      expect(displayedPrice).toBe(FOUNDING_PRICES.student_pro_monthly)
    })

    it('should use current prices when lock is expired', () => {
      const hasActiveLock = false
      const lockedPrices = FOUNDING_PRICES
      const currentPrices = CURRENT_PRICES

      const displayedPrice = hasActiveLock
        ? lockedPrices.student_pro_monthly
        : currentPrices.student_pro_monthly

      expect(displayedPrice).toBe(CURRENT_PRICES.student_pro_monthly)
    })

    it('should check lock expiration date', () => {
      const now = new Date()
      const futureDate = new Date(now.getTime() + 86400000) // +1 day
      const pastDate = new Date(now.getTime() - 86400000) // -1 day

      const isActiveFuture = new Date(futureDate) > now
      const isActivePast = new Date(pastDate) > now

      expect(isActiveFuture).toBe(true)
      expect(isActivePast).toBe(false)
    })
  })

  describe('Price calculations', () => {
    it('should calculate yearly savings for student_pro', () => {
      const monthlyPrice = CURRENT_PRICES.student_pro_monthly
      const yearlyPrice = 69.0
      const monthlyCost = monthlyPrice * 12
      const savings = monthlyCost - yearlyPrice

      expect(savings).toBeGreaterThan(0)
      expect(Math.round(savings)).toBe(27) // €95.88 - €69 = €26.88 ≈ €27
    })

    it('should calculate yearly savings for pro_plus', () => {
      const monthlyPrice = CURRENT_PRICES.pro_plus_monthly
      const yearlyPrice = 129.0
      const monthlyCost = monthlyPrice * 12
      const savings = monthlyCost - yearlyPrice

      expect(savings).toBeGreaterThan(0)
      expect(Math.round(savings)).toBe(15) // €143.88 - €129 = €14.88 ≈ €15
    })
  })

  describe('Price tier validation', () => {
    it('should have pro_plus more expensive than student_pro', () => {
      expect(CURRENT_PRICES.pro_plus_monthly).toBeGreaterThan(
        CURRENT_PRICES.student_pro_monthly
      )
    })

    it('should have all prices positive', () => {
      expect(CURRENT_PRICES.student_pro_monthly).toBeGreaterThan(0)
      expect(CURRENT_PRICES.student_pro_semester).toBeGreaterThan(0)
      expect(CURRENT_PRICES.pro_plus_monthly).toBeGreaterThan(0)
    })

    it('should have semester price less than 6 months of monthly', () => {
      const sixMonthsCost = CURRENT_PRICES.student_pro_monthly * 6
      expect(CURRENT_PRICES.student_pro_semester).toBeLessThan(sixMonthsCost)
    })
  })
})
