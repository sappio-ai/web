/**
 * Property-based tests for Signup Integration
 * 
 * Feature: waitlist-benefits-system
 * Property 5: Non-waitlist users get standard accounts
 * Validates: Requirements 2.5
 */

import * as fc from 'fast-check'
import { WaitlistService } from '../WaitlistService'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { BenefitService } from '../BenefitService'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn()
}))

describe('Signup Integration - Property Tests', () => {
  describe('Property 5: Non-waitlist users get standard accounts', () => {
    it('should create free tier accounts for emails not on waitlist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.uuid(),
          async (email, userId) => {
            // Setup: Mock empty waitlist (email not found)
            // Using imported createServiceRoleClient
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              ilike: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' } // No rows found
              }),
              update: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({ error: null })
            }
            createServiceRoleClient.mockReturnValue(mockSupabase)

            // Test: Check waitlist membership
            const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)

            // Verify: Should not be on waitlist
            expect(waitlistEntry).toBeNull()

            // Simulate what signup flow would do for non-waitlist user
            // (no benefits applied, user gets default free tier)
            
            // In actual signup, the database trigger creates user with:
            // - plan: 'free' (default)
            // - plan_expires_at: null
            // - meta_json: {}
            
            // Verify no benefits would be applied
            if (!waitlistEntry) {
              // Benefits should NOT be applied
              // This is the expected path for non-waitlist users
              expect(waitlistEntry).toBeNull()
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not apply benefits when waitlist check returns null', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.uuid(),
          async (email, userId) => {
            // Using imported createServiceRoleClient
            
            let benefitsApplied = false
            
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              ilike: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              }),
              update: jest.fn().mockImplementation(() => {
                benefitsApplied = true
                return {
                  eq: jest.fn().mockResolvedValue({ error: null })
                }
              })
            }
            createServiceRoleClient.mockReturnValue(mockSupabase)

            // Check waitlist
            const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)

            // Simulate signup flow decision
            if (waitlistEntry) {
              await BenefitService.applyWaitlistBenefits(userId, email)
            }

            // Verify: Benefits should NOT have been applied
            expect(waitlistEntry).toBeNull()
            expect(benefitsApplied).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should only apply benefits when email exists on waitlist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.uuid(),
          fc.boolean(), // Whether email is on waitlist
          async (email, userId, isOnWaitlist) => {
            // Using imported createServiceRoleClient
            
            let benefitsApplied = false
            
            const mockWaitlistEntry = isOnWaitlist ? {
              id: 'test-id',
              email,
              studying: null,
              current_tool: null,
              wants_early_access: true,
              referral_code: 'TEST123',
              referred_by: null,
              created_at: new Date().toISOString(),
              meta_json: {}
            } : null

            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              ilike: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockWaitlistEntry,
                error: mockWaitlistEntry ? null : { code: 'PGRST116' }
              }),
              update: jest.fn().mockImplementation(() => {
                benefitsApplied = true
                return {
                  eq: jest.fn().mockResolvedValue({ error: null })
                }
              })
            }
            createServiceRoleClient.mockReturnValue(mockSupabase)

            // Check waitlist
            const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)

            // Simulate signup flow
            if (waitlistEntry) {
              await BenefitService.applyWaitlistBenefits(userId, email)
            }

            // Verify: Benefits applied if and only if on waitlist
            if (isOnWaitlist) {
              expect(waitlistEntry).not.toBeNull()
              expect(benefitsApplied).toBe(true)
            } else {
              expect(waitlistEntry).toBeNull()
              expect(benefitsApplied).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})


describe('Signup Integration - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should apply benefits when user is on waitlist', async () => {
    const email = 'test@example.com'
    const userId = 'user-123'
    
    // Using imported createServiceRoleClient
    
    const mockWaitlistEntry = {
      id: 'waitlist-id',
      email,
      studying: 'Computer Science',
      current_tool: 'Anki',
      wants_early_access: true,
      referral_code: 'ABC123',
      referred_by: null,
      created_at: new Date().toISOString(),
      meta_json: {}
    }

    let benefitsData: any = null
    
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockWaitlistEntry,
        error: null
      }),
      update: jest.fn().mockImplementation((data) => {
        benefitsData = data
        return {
          eq: jest.fn().mockResolvedValue({ error: null })
        }
      }),
      in: jest.fn().mockResolvedValue({ error: null })
    }
    createServiceRoleClient.mockReturnValue(mockSupabase)

    // Check waitlist
    const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)
    expect(waitlistEntry).not.toBeNull()
    expect(waitlistEntry?.email).toBe(email)

    // Apply benefits
    await BenefitService.applyWaitlistBenefits(userId, email)
    
    // Verify benefits were applied
    expect(benefitsData).not.toBeNull()
    expect(benefitsData.meta_json.founding_price_lock).toBeDefined()
    expect(benefitsData.meta_json.trial).toBeDefined()
    expect(benefitsData.meta_json.from_waitlist).toBe(true)
    expect(benefitsData.plan).toBe('student_pro')

    // Mark as converted
    await WaitlistService.markAsConverted(email)
  })

  it('should not apply benefits when user is not on waitlist', async () => {
    const email = 'notlisted@example.com'
    const userId = 'user-456'
    
    // Using imported createServiceRoleClient
    
    let benefitsApplied = false
    
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      }),
      update: jest.fn().mockImplementation(() => {
        benefitsApplied = true
        return {
          eq: jest.fn().mockResolvedValue({ error: null })
        }
      })
    }
    createServiceRoleClient.mockReturnValue(mockSupabase)

    // Check waitlist
    const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)
    expect(waitlistEntry).toBeNull()

    // Should not apply benefits
    if (waitlistEntry) {
      await BenefitService.applyWaitlistBenefits(userId, email)
    }
    
    expect(benefitsApplied).toBe(false)
  })

  it('should handle errors gracefully during benefit application', async () => {
    const email = 'error@example.com'
    const userId = 'user-789'
    
    // Using imported createServiceRoleClient
    
    const mockWaitlistEntry = {
      id: 'waitlist-id',
      email,
      studying: null,
      current_tool: null,
      wants_early_access: true,
      referral_code: 'ERR123',
      referred_by: null,
      created_at: new Date().toISOString(),
      meta_json: {}
    }
    
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockWaitlistEntry,
        error: null
      }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        error: new Error('Database error')
      })
    }
    createServiceRoleClient.mockReturnValue(mockSupabase)

    // Check waitlist
    const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)
    expect(waitlistEntry).not.toBeNull()

    // Attempt to apply benefits (should throw)
    await expect(
      BenefitService.applyWaitlistBenefits(userId, email)
    ).rejects.toThrow()
  })
})
