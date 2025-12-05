/**
 * Property-based tests for plan check consistency
 * Feature: pricing-tier-implementation
 * Property 8: Plan checks are consistent
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4
 */

import * as fc from 'fast-check'
import { FeatureGateService } from '../FeatureGateService'
import type { PlanTier } from '@/lib/types/usage'

describe('Plan Check Consistency Property Tests', () => {
  /**
   * Property 8: Plan checks are consistent across all features
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4
   */
  test('Property 8: Plan checks are consistent across all features', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        (plan) => {
          // Get all feature access results
          const canExport = FeatureGateService.canExport(plan)
          const canUseTimedMode = FeatureGateService.canUseTimedMode(plan)
          const canUseWeakTopics = FeatureGateService.canUseWeakTopics(plan)
          const canAccessAdvancedAnalytics = FeatureGateService.canAccessAdvancedAnalytics(plan)

          // Define expected access for each plan
          const expectedAccess = {
            free: {
              export: false,
              timedMode: false,
              weakTopics: false,
              advancedAnalytics: false,
            },
            student_pro: {
              export: true,
              timedMode: true,
              weakTopics: true,
              advancedAnalytics: false,
            },
            pro_plus: {
              export: true,
              timedMode: true,
              weakTopics: true,
              advancedAnalytics: true,
            },
          }

          // Verify each feature matches expected access
          expect(canExport).toBe(expectedAccess[plan].export)
          expect(canUseTimedMode).toBe(expectedAccess[plan].timedMode)
          expect(canUseWeakTopics).toBe(expectedAccess[plan].weakTopics)
          expect(canAccessAdvancedAnalytics).toBe(expectedAccess[plan].advancedAnalytics)

          // Verify consistency: student_pro and pro_plus should have same access to basic features
          if (plan === 'student_pro' || plan === 'pro_plus') {
            expect(canExport).toBe(true)
            expect(canUseTimedMode).toBe(true)
            expect(canUseWeakTopics).toBe(true)
          }

          // Verify consistency: only pro_plus has advanced analytics
          if (plan === 'pro_plus') {
            expect(canAccessAdvancedAnalytics).toBe(true)
          } else {
            expect(canAccessAdvancedAnalytics).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 9: Error responses are consistent
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4
   */
  test('Property 9: Error responses are consistent in structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        (plan) => {
          // Get all error responses
          const exportError = FeatureGateService.checkExportAccess(plan)
          const timedModeError = FeatureGateService.checkTimedModeAccess(plan)
          const weakTopicsError = FeatureGateService.checkWeakTopicsAccess(plan)
          const analyticsError = FeatureGateService.checkAdvancedAnalyticsAccess(plan)

          // Collect all errors
          const errors = [exportError, timedModeError, weakTopicsError, analyticsError].filter(
            (e) => e !== null
          )

          // All errors should have consistent structure
          errors.forEach((error) => {
            expect(error).toHaveProperty('error')
            expect(error).toHaveProperty('code')
            expect(error).toHaveProperty('currentPlan')
            expect(error).toHaveProperty('requiredPlan')

            expect(error!.code).toBe('PLAN_UPGRADE_REQUIRED')
            expect(error!.currentPlan).toBe(plan)
            expect(['student_pro', 'pro_plus']).toContain(error!.requiredPlan)
            expect(typeof error!.error).toBe('string')
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 10: Plan hierarchy is respected
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4
   */
  test('Property 10: Plan hierarchy is respected (higher plans have all lower plan features)', () => {
    fc.assert(
      fc.property(fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'), (plan) => {
        const features = {
          export: FeatureGateService.canExport(plan),
          timedMode: FeatureGateService.canUseTimedMode(plan),
          weakTopics: FeatureGateService.canUseWeakTopics(plan),
          advancedAnalytics: FeatureGateService.canAccessAdvancedAnalytics(plan),
        }

        // Count accessible features
        const accessibleFeatures = Object.values(features).filter(Boolean).length

        // Verify hierarchy: higher plans should have more or equal features
        if (plan === 'free') {
          expect(accessibleFeatures).toBe(0)
        } else if (plan === 'student_pro') {
          expect(accessibleFeatures).toBe(3) // export, timed, weak topics
        } else if (plan === 'pro_plus') {
          expect(accessibleFeatures).toBe(4) // all features
        }

        // Verify monotonicity: if a lower plan has access, higher plans must too
        if (plan === 'pro_plus') {
          // Pro should have all student_pro features
          expect(features.export).toBe(true)
          expect(features.timedMode).toBe(true)
          expect(features.weakTopics).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 11: Required plan in errors matches actual requirements
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4
   */
  test('Property 11: Required plan in errors matches actual feature requirements', () => {
    fc.assert(
      fc.property(fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'), (plan) => {
        // Check each feature and verify required plan is correct
        const exportError = FeatureGateService.checkExportAccess(plan)
        if (exportError) {
          expect(exportError.requiredPlan).toBe('student_pro')
          // Verify that student_pro actually has access
          expect(FeatureGateService.canExport('student_pro')).toBe(true)
        }

        const timedModeError = FeatureGateService.checkTimedModeAccess(plan)
        if (timedModeError) {
          expect(timedModeError.requiredPlan).toBe('student_pro')
          expect(FeatureGateService.canUseTimedMode('student_pro')).toBe(true)
        }

        const weakTopicsError = FeatureGateService.checkWeakTopicsAccess(plan)
        if (weakTopicsError) {
          expect(weakTopicsError.requiredPlan).toBe('student_pro')
          expect(FeatureGateService.canUseWeakTopics('student_pro')).toBe(true)
        }

        const analyticsError = FeatureGateService.checkAdvancedAnalyticsAccess(plan)
        if (analyticsError) {
          expect(analyticsError.requiredPlan).toBe('pro_plus')
          expect(FeatureGateService.canAccessAdvancedAnalytics('pro_plus')).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 12: Check methods return null for allowed access
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4
   */
  test('Property 12: Check methods return null when access is allowed', () => {
    fc.assert(
      fc.property(fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'), (plan) => {
        // If can* method returns true, check* method should return null
        if (FeatureGateService.canExport(plan)) {
          expect(FeatureGateService.checkExportAccess(plan)).toBeNull()
        }

        if (FeatureGateService.canUseTimedMode(plan)) {
          expect(FeatureGateService.checkTimedModeAccess(plan)).toBeNull()
        }

        if (FeatureGateService.canUseWeakTopics(plan)) {
          expect(FeatureGateService.checkWeakTopicsAccess(plan)).toBeNull()
        }

        if (FeatureGateService.canAccessAdvancedAnalytics(plan)) {
          expect(FeatureGateService.checkAdvancedAnalyticsAccess(plan)).toBeNull()
        }

        // If can* method returns false, check* method should return error
        if (!FeatureGateService.canExport(plan)) {
          expect(FeatureGateService.checkExportAccess(plan)).not.toBeNull()
        }

        if (!FeatureGateService.canUseTimedMode(plan)) {
          expect(FeatureGateService.checkTimedModeAccess(plan)).not.toBeNull()
        }

        if (!FeatureGateService.canUseWeakTopics(plan)) {
          expect(FeatureGateService.checkWeakTopicsAccess(plan)).not.toBeNull()
        }

        if (!FeatureGateService.canAccessAdvancedAnalytics(plan)) {
          expect(FeatureGateService.checkAdvancedAnalyticsAccess(plan)).not.toBeNull()
        }
      }),
      { numRuns: 100 }
    )
  })
})
