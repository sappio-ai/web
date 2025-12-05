/**
 * Trial System Tests
 * 
 * Property-based and unit tests for trial functionality
 */

import * as fc from 'fast-check'
import { BenefitService, TrialInfo, UserBenefits } from '../BenefitService'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn()
}))

describe('Trial System - Property Tests', () => {
  describe('Property 4: Trial access is time-bound', () => {
    it('should grant access only during trial period', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: -30, max: 30 }), // Days offset from now
          async (daysOffset) => {
            const userId = `user-${Math.random()}`
            const now = new Date()
            const trialStart = new Date(now)
            trialStart.setDate(trialStart.getDate() - 3) // Started 3 days ago
            
            const trialExpiry = new Date(now)
            trialExpiry.setDate(trialExpiry.getDate() + daysOffset)
            
            const trial: TrialInfo = {
              plan: 'student_pro',
              started_at: trialStart.toISOString(),
              expires_at: trialExpiry.toISOString()
            }
            
            const benefits: UserBenefits = {
              trial,
              from_waitlist: true
            }
            
            // Mock database response
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  meta_json: benefits,
                  plan: 'student_pro',
                  plan_expires_at: trialExpiry.toISOString()
                },
                error: null
              })
            }
            
            ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
            
            const isInTrial = await BenefitService.isInTrial(userId)
            
            // Property: User is in trial if and only if current date < expiry date
            const shouldBeInTrial = daysOffset > 0
            expect(isInTrial).toBe(shouldBeInTrial)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

describe('Trial System - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isInTrial', () => {
    it('should return true when trial is active', async () => {
      const userId = 'user-123'
      const now = new Date()
      const futureDate = new Date(now)
      futureDate.setDate(futureDate.getDate() + 5)
      
      const trial: TrialInfo = {
        plan: 'student_pro',
        started_at: now.toISOString(),
        expires_at: futureDate.toISOString()
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { trial, from_waitlist: true },
            plan: 'student_pro',
            plan_expires_at: futureDate.toISOString()
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.isInTrial(userId)
      expect(result).toBe(true)
    })

    it('should return false when trial has expired', async () => {
      const userId = 'user-123'
      const now = new Date()
      const pastDate = new Date(now)
      pastDate.setDate(pastDate.getDate() - 2)
      
      const trial: TrialInfo = {
        plan: 'student_pro',
        started_at: pastDate.toISOString(),
        expires_at: pastDate.toISOString()
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { trial, from_waitlist: true },
            plan: 'student_pro',
            plan_expires_at: pastDate.toISOString()
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.isInTrial(userId)
      expect(result).toBe(false)
    })

    it('should return false when no trial exists', async () => {
      const userId = 'user-123'
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { from_waitlist: false },
            plan: 'free',
            plan_expires_at: null
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.isInTrial(userId)
      expect(result).toBe(false)
    })
  })

  describe('getTrialInfo', () => {
    it('should return trial info when it exists', async () => {
      const userId = 'user-123'
      const trial: TrialInfo = {
        plan: 'student_pro',
        started_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-08T00:00:00Z'
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { trial, from_waitlist: true }
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.getTrialInfo(userId)
      expect(result).toEqual(trial)
    })

    it('should return null when no trial exists', async () => {
      const userId = 'user-123'
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { from_waitlist: false }
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.getTrialInfo(userId)
      expect(result).toBeNull()
    })
  })

  describe('expireTrial', () => {
    it('should revert user to free tier', async () => {
      const userId = 'user-123'
      
      const mockUpdate = jest.fn().mockReturnThis()
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: mockUpdate,
        eq: jest.fn().mockResolvedValue({ error: null })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      await BenefitService.expireTrial(userId)
      
      expect(mockUpdate).toHaveBeenCalledWith({
        plan: 'free',
        plan_expires_at: null
      })
    })

    it('should throw error when update fails', async () => {
      const userId = 'user-123'
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: new Error('Database error')
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      await expect(BenefitService.expireTrial(userId)).rejects.toThrow()
    })
  })

  describe('getTrialDaysRemaining', () => {
    it('should calculate days remaining correctly', async () => {
      const userId = 'user-123'
      const now = new Date()
      const futureDate = new Date(now)
      futureDate.setDate(futureDate.getDate() + 5)
      
      const trial: TrialInfo = {
        plan: 'student_pro',
        started_at: now.toISOString(),
        expires_at: futureDate.toISOString()
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { trial, from_waitlist: true }
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.getTrialDaysRemaining(userId)
      expect(result).toBeGreaterThanOrEqual(4)
      expect(result).toBeLessThanOrEqual(5)
    })

    it('should return 0 for expired trial', async () => {
      const userId = 'user-123'
      const now = new Date()
      const pastDate = new Date(now)
      pastDate.setDate(pastDate.getDate() - 2)
      
      const trial: TrialInfo = {
        plan: 'student_pro',
        started_at: pastDate.toISOString(),
        expires_at: pastDate.toISOString()
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { trial, from_waitlist: true }
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.getTrialDaysRemaining(userId)
      expect(result).toBe(0)
    })

    it('should return null when no trial exists', async () => {
      const userId = 'user-123'
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            meta_json: { from_waitlist: false }
          },
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const result = await BenefitService.getTrialDaysRemaining(userId)
      expect(result).toBeNull()
    })
  })
})
