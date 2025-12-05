/**
 * Unit tests for FeatureGateService
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { describe, it, expect } from '@jest/globals'
import { FeatureGateService } from '../FeatureGateService'

describe('FeatureGateService', () => {
  describe('canExport', () => {
    it('should block free users', () => {
      expect(FeatureGateService.canExport('free')).toBe(false)
    })

    it('should allow student_pro users', () => {
      expect(FeatureGateService.canExport('student_pro')).toBe(true)
    })

    it('should allow pro_plus users', () => {
      expect(FeatureGateService.canExport('pro_plus')).toBe(true)
    })
  })

  describe('canUseTimedMode', () => {
    it('should block free users', () => {
      expect(FeatureGateService.canUseTimedMode('free')).toBe(false)
    })

    it('should allow student_pro users', () => {
      expect(FeatureGateService.canUseTimedMode('student_pro')).toBe(true)
    })

    it('should allow pro_plus users', () => {
      expect(FeatureGateService.canUseTimedMode('pro_plus')).toBe(true)
    })
  })

  describe('canUseWeakTopics', () => {
    it('should block free users', () => {
      expect(FeatureGateService.canUseWeakTopics('free')).toBe(false)
    })

    it('should allow student_pro users', () => {
      expect(FeatureGateService.canUseWeakTopics('student_pro')).toBe(true)
    })

    it('should allow pro_plus users', () => {
      expect(FeatureGateService.canUseWeakTopics('pro_plus')).toBe(true)
    })
  })

  describe('canAccessAdvancedAnalytics', () => {
    it('should block free users', () => {
      expect(FeatureGateService.canAccessAdvancedAnalytics('free')).toBe(false)
    })

    it('should block student_pro users', () => {
      expect(FeatureGateService.canAccessAdvancedAnalytics('student_pro')).toBe(false)
    })

    it('should allow pro_plus users', () => {
      expect(FeatureGateService.canAccessAdvancedAnalytics('pro_plus')).toBe(true)
    })
  })

  describe('createUpgradeError', () => {
    it('should create correct error structure', () => {
      const error = FeatureGateService.createUpgradeError('free', 'student_pro', 'Export')

      expect(error).toHaveProperty('error')
      expect(error).toHaveProperty('code')
      expect(error).toHaveProperty('currentPlan')
      expect(error).toHaveProperty('requiredPlan')
      expect(error.code).toBe('PLAN_UPGRADE_REQUIRED')
    })

    it('should include current plan in error', () => {
      const error = FeatureGateService.createUpgradeError('free', 'student_pro', 'Export')

      expect(error.currentPlan).toBe('free')
    })

    it('should include required plan in error', () => {
      const error = FeatureGateService.createUpgradeError('free', 'student_pro', 'Export')

      expect(error.requiredPlan).toBe('student_pro')
    })

    it('should include feature name in error message', () => {
      const error = FeatureGateService.createUpgradeError('free', 'student_pro', 'Export')

      expect(error.error).toContain('Export')
    })
  })

  describe('checkExportAccess', () => {
    it('should return error for free users', () => {
      const error = FeatureGateService.checkExportAccess('free')

      expect(error).not.toBeNull()
      expect(error?.code).toBe('PLAN_UPGRADE_REQUIRED')
    })

    it('should return null for student_pro users', () => {
      const error = FeatureGateService.checkExportAccess('student_pro')

      expect(error).toBeNull()
    })

    it('should return null for pro_plus users', () => {
      const error = FeatureGateService.checkExportAccess('pro_plus')

      expect(error).toBeNull()
    })
  })

  describe('checkTimedModeAccess', () => {
    it('should return error for free users', () => {
      const error = FeatureGateService.checkTimedModeAccess('free')

      expect(error).not.toBeNull()
      expect(error?.code).toBe('PLAN_UPGRADE_REQUIRED')
    })

    it('should return null for student_pro users', () => {
      const error = FeatureGateService.checkTimedModeAccess('student_pro')

      expect(error).toBeNull()
    })
  })

  describe('checkWeakTopicsAccess', () => {
    it('should return error for free users', () => {
      const error = FeatureGateService.checkWeakTopicsAccess('free')

      expect(error).not.toBeNull()
      expect(error?.code).toBe('PLAN_UPGRADE_REQUIRED')
    })

    it('should return null for student_pro users', () => {
      const error = FeatureGateService.checkWeakTopicsAccess('student_pro')

      expect(error).toBeNull()
    })
  })

  describe('checkAdvancedAnalyticsAccess', () => {
    it('should return error for free users', () => {
      const error = FeatureGateService.checkAdvancedAnalyticsAccess('free')

      expect(error).not.toBeNull()
      expect(error?.code).toBe('PLAN_UPGRADE_REQUIRED')
    })

    it('should return error for student_pro users', () => {
      const error = FeatureGateService.checkAdvancedAnalyticsAccess('student_pro')

      expect(error).not.toBeNull()
      expect(error?.code).toBe('PLAN_UPGRADE_REQUIRED')
    })

    it('should return null for pro_plus users', () => {
      const error = FeatureGateService.checkAdvancedAnalyticsAccess('pro_plus')

      expect(error).toBeNull()
    })
  })
})
