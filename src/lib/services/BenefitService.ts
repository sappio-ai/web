/**
 * BenefitService
 * 
 * Manages waitlist benefits including founding price locks and trials.
 * Handles benefit application, validation, and expiration.
 */

import { createServiceRoleClient } from '@/lib/supabase/server'

export interface FoundingPriceLock {
  enabled: boolean
  expires_at: string
  locked_prices: {
    student_pro_monthly: number
    student_pro_semester: number
    pro_plus_monthly: number
  }
}

export interface TrialInfo {
  plan: 'student_pro' | 'pro_plus'
  started_at: string
  expires_at: string
}

export interface UserBenefits {
  founding_price_lock?: FoundingPriceLock
  trial?: TrialInfo
  from_waitlist: boolean
}

// Current pricing (as of waitlist launch)
const FOUNDING_PRICES = {
  student_pro_monthly: 7.99,
  student_pro_semester: 24.00,
  pro_plus_monthly: 11.99
}

export class BenefitService {
  /**
   * Apply all waitlist benefits to a new user
   * - Founding price lock (12 months)
   * - 7-day Student Pro trial
   * - Mark as from waitlist
   */
  static async applyWaitlistBenefits(userId: string, email: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      const now = new Date()
      const priceLockExpiry = new Date(now)
      priceLockExpiry.setFullYear(priceLockExpiry.getFullYear() + 1) // 12 months
      
      const trialExpiry = new Date(now)
      trialExpiry.setDate(trialExpiry.getDate() + 7) // 7 days
      
      const benefits: UserBenefits = {
        founding_price_lock: {
          enabled: true,
          expires_at: priceLockExpiry.toISOString(),
          locked_prices: FOUNDING_PRICES
        },
        trial: {
          plan: 'student_pro',
          started_at: now.toISOString(),
          expires_at: trialExpiry.toISOString()
        },
        from_waitlist: true
      }
      
      // Update user with benefits and trial plan
      const { error } = await supabase
        .from('users')
        .update({
          meta_json: benefits,
          plan: 'student_pro', // Grant trial access
          plan_expires_at: trialExpiry.toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('[BenefitService] Error applying benefits:', error)
        throw error
      }
      
      console.log(`[BenefitService] Applied waitlist benefits to user ${userId}`)
    } catch (error) {
      console.error('[BenefitService] Failed to apply benefits:', error)
      throw error
    }
  }

  /**
   * Check if user has an active founding price lock
   */
  static async hasActivePriceLock(userId: string): Promise<boolean> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('meta_json')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return false
      }

      const benefits = data.meta_json as UserBenefits
      const priceLock = benefits?.founding_price_lock
      
      if (!priceLock || !priceLock.enabled) {
        return false
      }
      
      // Check if not expired
      const now = new Date()
      const expiryDate = new Date(priceLock.expires_at)
      
      return now < expiryDate
    } catch (error) {
      console.error('[BenefitService] Error checking price lock:', error)
      return false
    }
  }

  /**
   * Get locked prices for a user (if active)
   */
  static async getLockedPrices(userId: string): Promise<FoundingPriceLock['locked_prices'] | null> {
    try {
      const hasLock = await this.hasActivePriceLock(userId)
      
      if (!hasLock) {
        return null
      }
      
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('meta_json')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return null
      }

      const benefits = data.meta_json as UserBenefits
      return benefits?.founding_price_lock?.locked_prices || null
    } catch (error) {
      console.error('[BenefitService] Error getting locked prices:', error)
      return null
    }
  }

  /**
   * Check if user is currently in trial period
   */
  static async isInTrial(userId: string): Promise<boolean> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('meta_json, plan, plan_expires_at')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return false
      }

      const benefits = data.meta_json as UserBenefits
      const trial = benefits?.trial
      
      if (!trial) {
        return false
      }
      
      // Check if trial is active
      const now = new Date()
      const expiryDate = new Date(trial.expires_at)
      
      return now < expiryDate && data.plan === trial.plan
    } catch (error) {
      console.error('[BenefitService] Error checking trial:', error)
      return false
    }
  }

  /**
   * Get trial information for a user
   */
  static async getTrialInfo(userId: string): Promise<TrialInfo | null> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('meta_json')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return null
      }

      const benefits = data.meta_json as UserBenefits
      return benefits?.trial || null
    } catch (error) {
      console.error('[BenefitService] Error getting trial info:', error)
      return null
    }
  }

  /**
   * Expire trial and revert user to free tier
   */
  static async expireTrial(userId: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      const { error } = await supabase
        .from('users')
        .update({
          plan: 'free',
          plan_expires_at: null
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
      
      console.log(`[BenefitService] Expired trial for user ${userId}`)
    } catch (error) {
      console.error('[BenefitService] Error expiring trial:', error)
      throw error
    }
  }

  /**
   * Get days remaining in trial
   */
  static async getTrialDaysRemaining(userId: string): Promise<number | null> {
    try {
      const trial = await this.getTrialInfo(userId)
      
      if (!trial) {
        return null
      }
      
      const now = new Date()
      const expiryDate = new Date(trial.expires_at)
      const diffMs = expiryDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      
      return diffDays > 0 ? diffDays : 0
    } catch (error) {
      console.error('[BenefitService] Error calculating trial days:', error)
      return null
    }
  }
}
