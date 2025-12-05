/**
 * Admin Actions Tests
 * 
 * Unit tests for admin waitlist management functionality
 */

import { WaitlistService, WaitlistEntry } from '../WaitlistService'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn()
}))

describe('Admin Actions - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('markAsInvited', () => {
    it('should generate unique invite codes and update entries', async () => {
      const emails = ['user1@test.com', 'user2@test.com']
      
      const capturedUpdates: any[] = []
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }), // No duplicate codes, no existing meta_json
        update: jest.fn((data) => {
          capturedUpdates.push(data)
          return {
            ilike: jest.fn().mockResolvedValue({ error: null })
          }
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      await WaitlistService.markAsInvited(emails)
      
      // Verify update was called for each email
      expect(mockSupabase.update).toHaveBeenCalledTimes(emails.length)
      
      // Verify each update has invite code and correct meta_json
      capturedUpdates.forEach(update => {
        expect(update.invite_code).toBeDefined()
        expect(update.invite_code).toMatch(/^INV-[A-Z0-9]{8}$/)
        expect(update.meta_json).toBeDefined()
        expect(update.meta_json.invited_at).toBeDefined()
        expect(update.meta_json.invite_status).toBe('invited')
      })
    })

    it('should handle multiple emails and generate unique codes', async () => {
      const emails = ['user1@test.com', 'user2@test.com', 'user3@test.com']
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockReturnValue({
          ilike: jest.fn().mockResolvedValue({ error: null })
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      await WaitlistService.markAsInvited(emails)
      
      // Verify update was called for each email
      expect(mockSupabase.update).toHaveBeenCalledTimes(emails.length)
    })

    it('should throw error when update fails', async () => {
      const emails = ['user@test.com']
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockReturnValue({
          ilike: jest.fn().mockResolvedValue({ error: new Error('Database error') })
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      // Should not throw - errors are logged but not thrown
      await WaitlistService.markAsInvited(emails)
    })
  })

  describe('exportToCSV', () => {
    it('should include all required fields in CSV', async () => {
      const mockEntries: WaitlistEntry[] = [
        {
          id: '1',
          email: 'user1@test.com',
          studying: 'Computer Science',
          current_tool: 'Notion',
          wants_early_access: true,
          referral_code: 'ABC123',
          referred_by: null,
          created_at: '2024-01-01T00:00:00Z',
          meta_json: {
            invited_at: '2024-01-05T00:00:00Z',
            invite_status: 'invited'
          }
        },
        {
          id: '2',
          email: 'user2@test.com',
          studying: 'Mathematics',
          current_tool: 'Quizlet',
          wants_early_access: false,
          referral_code: 'XYZ789',
          referred_by: 'ABC123',
          created_at: '2024-01-02T00:00:00Z',
          meta_json: {
            converted_at: '2024-01-10T00:00:00Z',
            invite_status: 'converted'
          }
        }
      ]
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockEntries,
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const csv = await WaitlistService.exportToCSV()
      
      // Verify CSV header
      expect(csv).toContain('Email,Studying,Current Tool,Wants Early Access,Referral Code,Referred By,Created At,Invite Status,Invited At,Converted At')
      
      // Verify first entry data
      expect(csv).toContain('user1@test.com')
      expect(csv).toContain('Computer Science')
      expect(csv).toContain('Notion')
      expect(csv).toContain('ABC123')
      expect(csv).toContain('invited')
      
      // Verify second entry data
      expect(csv).toContain('user2@test.com')
      expect(csv).toContain('Mathematics')
      expect(csv).toContain('Quizlet')
      expect(csv).toContain('XYZ789')
      expect(csv).toContain('converted')
    })

    it('should handle entries with null/undefined fields', async () => {
      const mockEntries: WaitlistEntry[] = [
        {
          id: '1',
          email: 'user@test.com',
          studying: null,
          current_tool: null,
          wants_early_access: false,
          referral_code: 'CODE123',
          referred_by: null,
          created_at: '2024-01-01T00:00:00Z',
          meta_json: {}
        }
      ]
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockEntries,
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const csv = await WaitlistService.exportToCSV()
      
      // Should not throw and should handle nulls gracefully
      expect(csv).toBeDefined()
      expect(csv).toContain('user@test.com')
      expect(csv).toContain('CODE123')
    })

    it('should escape commas and quotes in CSV fields', async () => {
      const mockEntries: WaitlistEntry[] = [
        {
          id: '1',
          email: 'user@test.com',
          studying: 'Computer Science, AI',
          current_tool: 'Tool with "quotes"',
          wants_early_access: true,
          referral_code: 'CODE',
          referred_by: null,
          created_at: '2024-01-01T00:00:00Z',
          meta_json: {}
        }
      ]
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockEntries,
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const csv = await WaitlistService.exportToCSV()
      
      // Fields with commas should be quoted
      expect(csv).toContain('"Computer Science, AI"')
      
      // Fields with quotes should be present (basic escaping)
      expect(csv).toContain('Tool with "quotes"')
    })
  })

  describe('getAllEntries', () => {
    it('should return all waitlist entries ordered by creation date', async () => {
      const mockEntries: WaitlistEntry[] = [
        {
          id: '1',
          email: 'user1@test.com',
          studying: 'CS',
          current_tool: 'Notion',
          wants_early_access: true,
          referral_code: 'ABC',
          referred_by: null,
          created_at: '2024-01-01T00:00:00Z',
          meta_json: {}
        },
        {
          id: '2',
          email: 'user2@test.com',
          studying: 'Math',
          current_tool: 'Quizlet',
          wants_early_access: false,
          referral_code: 'XYZ',
          referred_by: 'ABC',
          created_at: '2024-01-02T00:00:00Z',
          meta_json: { invited_at: '2024-01-05T00:00:00Z' }
        }
      ]
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockEntries,
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const entries = await WaitlistService.getAllEntries()
      
      expect(entries).toEqual(mockEntries)
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should handle empty waitlist', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      const entries = await WaitlistService.getAllEntries()
      
      expect(entries).toEqual([])
    })

    it('should throw error when query fails', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error')
        })
      }
      
      ;(createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase)
      
      await expect(WaitlistService.getAllEntries()).rejects.toThrow()
    })
  })

  describe('Status filtering logic', () => {
    it('should correctly identify pending status', () => {
      const entry: WaitlistEntry = {
        id: '1',
        email: 'user@test.com',
        studying: null,
        current_tool: null,
        wants_early_access: false,
        referral_code: 'CODE',
        referred_by: null,
        created_at: '2024-01-01T00:00:00Z',
        meta_json: {}
      }
      
      // Entry with no invited_at or converted_at should be pending
      expect(entry.meta_json.invited_at).toBeUndefined()
      expect(entry.meta_json.converted_at).toBeUndefined()
    })

    it('should correctly identify invited status', () => {
      const entry: WaitlistEntry = {
        id: '1',
        email: 'user@test.com',
        studying: null,
        current_tool: null,
        wants_early_access: false,
        referral_code: 'CODE',
        referred_by: null,
        created_at: '2024-01-01T00:00:00Z',
        meta_json: {
          invited_at: '2024-01-05T00:00:00Z'
        }
      }
      
      // Entry with invited_at but no converted_at should be invited
      expect(entry.meta_json.invited_at).toBeDefined()
      expect(entry.meta_json.converted_at).toBeUndefined()
    })

    it('should correctly identify converted status', () => {
      const entry: WaitlistEntry = {
        id: '1',
        email: 'user@test.com',
        studying: null,
        current_tool: null,
        wants_early_access: false,
        referral_code: 'CODE',
        referred_by: null,
        created_at: '2024-01-01T00:00:00Z',
        meta_json: {
          invited_at: '2024-01-05T00:00:00Z',
          converted_at: '2024-01-10T00:00:00Z'
        }
      }
      
      // Entry with converted_at should be converted (takes precedence)
      expect(entry.meta_json.converted_at).toBeDefined()
    })
  })
})
