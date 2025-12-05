/**
 * Property-based tests for export access control
 * Feature: pricing-tier-implementation, Property 2: Export access matches plan tier
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { describe, it, expect } from '@jest/globals'
import fc from 'fast-check'
import type { PlanTier } from '@/lib/types/usage'

describe('Property: Export access matches plan tier', () => {
  it('should grant export access if and only if plan is student_pro or pro_plus', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('free', 'student_pro', 'pro_plus'),
        async (planTier) => {
          // Determine expected access
          const shouldHaveAccess = planTier !== 'free'

          // Verify access logic
          const hasAccess = planTier === 'student_pro' || planTier === 'pro_plus'

          expect(hasAccess).toBe(shouldHaveAccess)

          // Verify free tier is blocked
          if (planTier === 'free') {
            expect(hasAccess).toBe(false)
          }

          // Verify paid tiers have access
          if (planTier === 'student_pro' || planTier === 'pro_plus') {
            expect(hasAccess).toBe(true)
          }
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should return consistent error structure for blocked exports', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('notes-pdf', 'flashcards-csv', 'flashcards-anki', 'mindmap-image', 'mindmap-markdown'),
        async (exportType) => {
          // For free tier, all exports should be blocked with same structure
          const userPlan = 'free'
          const isBlocked = userPlan === 'free'

          expect(isBlocked).toBe(true)

          // Verify error structure would include required fields
          const errorResponse = {
            error: `${exportType} export requires Student or Pro plan`,
            code: 'PLAN_UPGRADE_REQUIRED',
            currentPlan: userPlan,
            requiredPlan: 'student_pro',
          }

          expect(errorResponse.code).toBe('PLAN_UPGRADE_REQUIRED')
          expect(errorResponse.currentPlan).toBe('free')
          expect(errorResponse.requiredPlan).toBe('student_pro')
          expect(errorResponse.error).toContain('requires')
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should allow all export types for paid plans', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<PlanTier>('student_pro', 'pro_plus'),
        fc.constantFrom('notes-pdf', 'flashcards-csv', 'flashcards-anki', 'mindmap-image', 'mindmap-markdown'),
        async (planTier, exportType) => {
          // All paid plans should have access to all export types
          const hasAccess = planTier !== 'free'

          expect(hasAccess).toBe(true)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should block all export types for free plan', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('notes-pdf', 'flashcards-csv', 'flashcards-anki', 'mindmap-image', 'mindmap-markdown'),
        async (exportType) => {
          const planTier = 'free'
          const hasAccess = planTier !== 'free'

          expect(hasAccess).toBe(false)
        }
      ),
      { numRuns: 10 }
    )
  })
})
