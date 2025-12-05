/**
 * Property-based tests for WaitlistService
 * 
 * Feature: waitlist-benefits-system
 * Property 1: Waitlist detection accuracy
 * Validates: Requirements 2.1
 */

import * as fc from 'fast-check'
import { WaitlistService } from '../WaitlistService'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn()
}))

describe('WaitlistService - Property Tests', () => {
  describe('Property 1: Waitlist detection accuracy', () => {
    it('should return entry if and only if email exists in waitlist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.emailAddress(), { minLength: 5, maxLength: 20 }),
          fc.emailAddress(),
          async (waitlistEmails, testEmail) => {
            // Setup: Mock database with waitlist emails
            const mockWaitlist = waitlistEmails.map((email, idx) => ({
              id: `id-${idx}`,
              email,
              studying: null,
              current_tool: null,
              wants_early_access: true,
              referral_code: `REF${idx}`,
              referred_by: null,
              created_at: new Date().toISOString(),
              meta_json: {}
            }))

            // Using imported createServiceRoleClient
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              ilike: jest.fn().mockReturnThis(),
              single: jest.fn().mockImplementation(() => {
                const normalizedTestEmail = testEmail.toLowerCase()
                const found = mockWaitlist.find(
                  entry => entry.email.toLowerCase() === normalizedTestEmail
                )
                
                if (found) {
                  return { data: found, error: null }
                } else {
                  return { data: null, error: { code: 'PGRST116' } }
                }
              })
            }
            createServiceRoleClient.mockReturnValue(mockSupabase)

            // Test
            const result = await WaitlistService.checkWaitlistMembership(testEmail)
            const shouldExist = waitlistEmails.some(
              email => email.toLowerCase() === testEmail.toLowerCase()
            )

            // Verify: Result matches expected presence
            if (shouldExist) {
              expect(result).not.toBeNull()
              expect(result?.email.toLowerCase()).toBe(testEmail.toLowerCase())
            } else {
              expect(result).toBeNull()
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle case-insensitive email matching', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (email) => {
            // Setup: Mock database with lowercase email
            const mockEntry = {
              id: 'test-id',
              email: email.toLowerCase(),
              studying: null,
              current_tool: null,
              wants_early_access: true,
              referral_code: 'TEST123',
              referred_by: null,
              created_at: new Date().toISOString(),
              meta_json: {}
            }

            // Using imported createServiceRoleClient
            const mockSupabase = {
              from: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              ilike: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockEntry, error: null })
            }
            createServiceRoleClient.mockReturnValue(mockSupabase)

            // Test with various casings
            const upperResult = await WaitlistService.checkWaitlistMembership(email.toUpperCase())
            const lowerResult = await WaitlistService.checkWaitlistMembership(email.toLowerCase())
            const mixedResult = await WaitlistService.checkWaitlistMembership(email)

            // Verify: All casings should find the entry
            expect(upperResult).not.toBeNull()
            expect(lowerResult).not.toBeNull()
            expect(mixedResult).not.toBeNull()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
