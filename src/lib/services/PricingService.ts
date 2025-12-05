/**
 * PricingService
 * 
 * Handles pricing logic including founding price locks
 */

import { BenefitService } from './BenefitService'

export interface PricingTier {
  name: string
  monthlyPrice: number
  semesterPrice?: number
  isLocked?: boolean
  lockExpiresAt?: string
}

// Current market prices
const CURRENT_PRICES = {
  student_pro_monthly: 7.99,
  student_pro_semester: 24.00,
  pro_plus_monthly: 11.99
}

export class PricingService {
  /**
   * Get pricing for a user (respects price locks)
   */
  static async getPricingForUser(userId: string | null): Promise<{
    studentPro: PricingTier
    proPlus: PricingTier
  }> {
    // If no user, return current prices
    if (!userId) {
      return {
        studentPro: {
          name: 'Student Pro',
          monthlyPrice: CURRENT_PRICES.student_pro_monthly,
          semesterPrice: CURRENT_PRICES.student_pro_semester,
          isLocked: false
        },
        proPlus: {
          name: 'Pro+',
          monthlyPrice: CURRENT_PRICES.pro_plus_monthly,
          isLocked: false
        }
      }
    }

    // Check for price lock
    const hasLock = await BenefitService.hasActivePriceLock(userId)
    
    if (hasLock) {
      const lockedPrices = await BenefitService.getLockedPrices(userId)
      
      if (lockedPrices) {
        // Get lock expiration for display
        const { createServiceRoleClient } = await import('@/lib/supabase/server')
        const supabase = createServiceRoleClient()
        
        const { data } = await supabase
          .from('users')
          .select('meta_json')
          .eq('id', userId)
          .single()
        
        const lockExpiresAt = data?.meta_json?.founding_price_lock?.expires_at
        
        return {
          studentPro: {
            name: 'Student Pro',
            monthlyPrice: lockedPrices.student_pro_monthly,
            semesterPrice: lockedPrices.student_pro_semester,
            isLocked: true,
            lockExpiresAt
          },
          proPlus: {
            name: 'Pro+',
            monthlyPrice: lockedPrices.pro_plus_monthly,
            isLocked: true,
            lockExpiresAt
          }
        }
      }
    }

    // No lock, return current prices
    return {
      studentPro: {
        name: 'Student Pro',
        monthlyPrice: CURRENT_PRICES.student_pro_monthly,
        semesterPrice: CURRENT_PRICES.student_pro_semester,
        isLocked: false
      },
      proPlus: {
        name: 'Pro+',
        monthlyPrice: CURRENT_PRICES.pro_plus_monthly,
        isLocked: false
      }
    }
  }

  /**
   * Get current market prices (for comparison)
   */
  static getCurrentPrices() {
    return CURRENT_PRICES
  }
}
