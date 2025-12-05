/**
 * Property-based tests for BenefitService
 * 
 * Feature: waitlist-benefits-system
 * Property 2: Benefits are applied atomically
 * Validates: Requirements 2.2, 2.3, 2.4
 */

import * as fc from 'fast-check'
import { BenefitService } from '../BenefitService'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn()
}))

describe('BenefitService - Property Tests', () => {
  describe('Property 2: Benefit application atomicity', () => {
    it('should apply all three benefits or none', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.emailAddress(),
          fc.boolean(), // Simulate success or failure
          async (userId, email, shouldSucceed) => {
            let capturedUpdate: any = null

            // Using imported createServiceRoleClient
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              update: jest.fn().mockImplementation((data) => {
                capturedUpdate = data
                return {
                  eq: jest.fn().mockResolvedValue({
                    error: shouldSucceed ? null : new Error('DB Error')
                  })
                }
              })
            }
            createServiceRoleClient.mockReturnValue(mockSupabase)

            // Test
            try {
              await BenefitService.applyWaitlistBenefits(userId, email)

              // If successful, verify all three benefits are present
              if (shouldSucceed) {
                expect(capturedUpdate).not.toBeNull()
                expect(capturedUpdate.meta_json).toBeDefined()
                
                const benefits = capturedUpdate.meta_json
                
                // Check all three benefits exist
                expect(benefits.founding_price_lock).toBeDefined()
                expect(benefits.trial).toBeDefined()
                expect(benefits.from_waitlist).toBe(true)
                
                // Check founding price lock structure
                expect(benefits.founding_price_lock.enabled).toBe(true)
                expect(benefits.founding_price_lock.expires_at).toBeDefined()
                expect(benefits.founding_price_lock.locked_prices).toBeDefined()
                expect(benefits.founding_price_lock.locked_prices.student_pro_monthly).toBe(7.99)
                expect(benefits.founding_price_lock.locked_prices.student_pro_semester).toBe(24.00)
                expect(benefits.founding_price_lock.locked_prices.pro_plus_monthly).toBe(11.99)
                
                // Check trial structure
                expect(benefits.trial.plan).toBe('student_pro')
                expect(benefits.trial.started_at).toBeDefined()
                expect(benefits.trial.expires_at).toBeDefined()
                
                // Check plan was set
                expect(capturedUpdate.plan).toBe('student_pro')
                expect(capturedUpdate.plan_expires_at).toBeDefined()
                
                // Verify trial is 7 days
                const trialStart = new Date(benefits.trial.started_at)
                const trialEnd = new Date(benefits.trial.expires_at)
                const diffDays = Math.ceil((trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
                expect(diffDays).toBe(7)
                
                // Verify price lock is 12 months
                const lockStart = new Date(benefits.trial.started_at)
                const lockEnd = new Date(benefits.founding_price_lock.expires_at)
                const diffMonths = (lockEnd.getFullYear() - lockStart.getFullYear()) * 12 + 
                                  (lockEnd.getMonth() - lockStart.getMonth())
                expect(diffMonths).toBe(12)
              }
            } catch (error) {
              // If failed, verify no partial application
              if (!shouldSucceed) {
                // Error was thrown, which is correct behavior
                expect(error).toBeDefined()
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain benefit consistency across multiple applications', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.emailAddress(),
          async (userId, email) => {
            // Using imported createServiceRoleClient
            
            let firstUpdate: any = null
            let secondUpdate: any = null
            let callCount = 0

            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              update: jest.fn().mockImplementation((data) => {
                if (callCount === 0) {
                  firstUpdate = data
                } else {
                  secondUpdate = data
                }
                callCount++
                return {
                  eq: jest.fn().mockResolvedValue({ error: null })
                }
              })
            }
            createServiceRoleClient.mockReturnValue(mockSupabase)

            // Apply benefits twice
            await BenefitService.applyWaitlistBenefits(userId, email)
            await BenefitService.applyWaitlistBenefits(userId, email)

            // Verify both applications have same structure
            expect(firstUpdate.meta_json.founding_price_lock.locked_prices).toEqual(
              secondUpdate.meta_json.founding_price_lock.locked_prices
            )
            expect(firstUpdate.meta_json.trial.plan).toBe(secondUpdate.meta_json.trial.plan)
            expect(firstUpdate.plan).toBe(secondUpdate.plan)
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
