/**
 * FeatureGateService
 * 
 * Centralized service for checking feature access based on user plan
 */

import { createServiceRoleClient } from '@/lib/supabase/server'

export interface FeatureGateError {
  error: string
  code: 'PLAN_UPGRADE_REQUIRED'
  currentPlan: string
  requiredPlan: string
}

export class FeatureGateService {
  /**
   * Get user plan from database
   */
  static async getUserPlan(userId: string): Promise<string | null> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data: user, error } = await supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single()
      
      if (error || !user) {
        console.error('Failed to fetch user plan:', error)
        return null
      }
      
      return user.plan
    } catch (error) {
      console.error('Error fetching user plan:', error)
      return null
    }
  }

  /**
   * Check if user can export content
   * Requires: student_pro or pro_plus
   */
  static canExport(userPlan: string): boolean {
    return userPlan === 'student_pro' || userPlan === 'pro_plus'
  }

  /**
   * Check if user can use timed quiz mode
   * Requires: student_pro or pro_plus
   */
  static canUseTimedMode(userPlan: string): boolean {
    return userPlan === 'student_pro' || userPlan === 'pro_plus'
  }

  /**
   * Check if user can use weak topics practice
   * Requires: student_pro or pro_plus
   */
  static canUseWeakTopics(userPlan: string): boolean {
    return userPlan === 'student_pro' || userPlan === 'pro_plus'
  }

  /**
   * Check if user can access advanced analytics
   * Requires: pro_plus
   */
  static canAccessAdvancedAnalytics(userPlan: string): boolean {
    return userPlan === 'pro_plus'
  }

  /**
   * Create standardized error response for plan upgrade required
   */
  static createUpgradeError(
    currentPlan: string,
    requiredPlan: 'student_pro' | 'pro_plus',
    featureName: string
  ): FeatureGateError {
    return {
      error: `${featureName} requires ${requiredPlan === 'student_pro' ? 'Student Pro' : 'Pro'} plan`,
      code: 'PLAN_UPGRADE_REQUIRED',
      currentPlan,
      requiredPlan,
    }
  }

  /**
   * Check export access and return error if blocked
   */
  static checkExportAccess(userPlan: string): FeatureGateError | null {
    if (!this.canExport(userPlan)) {
      return this.createUpgradeError(userPlan, 'student_pro', 'Export')
    }
    return null
  }

  /**
   * Check timed mode access and return error if blocked
   */
  static checkTimedModeAccess(userPlan: string): FeatureGateError | null {
    if (!this.canUseTimedMode(userPlan)) {
      return this.createUpgradeError(userPlan, 'student_pro', 'Timed quiz mode')
    }
    return null
  }

  /**
   * Check weak topics access and return error if blocked
   */
  static checkWeakTopicsAccess(userPlan: string): FeatureGateError | null {
    if (!this.canUseWeakTopics(userPlan)) {
      return this.createUpgradeError(userPlan, 'student_pro', 'Weak topics practice')
    }
    return null
  }

  /**
   * Check advanced analytics access and return error if blocked
   */
  static checkAdvancedAnalyticsAccess(userPlan: string): FeatureGateError | null {
    if (!this.canAccessAdvancedAnalytics(userPlan)) {
      return this.createUpgradeError(userPlan, 'pro_plus', 'Advanced analytics')
    }
    return null
  }
}
