/**
 * Admin Waitlist API Integration Tests
 * 
 * Tests for admin waitlist management endpoints
 */

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth/admin')
jest.mock('@/lib/services/WaitlistService')
jest.mock('@/lib/email/EmailService', () => ({
  EmailService: {
    sendBulkInvites: jest.fn()
  }
}))
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn()
}))

import { NextRequest } from 'next/server'
import { GET as getWaitlist } from '../route'
import { POST as markInvited } from '../invite/route'
import { GET as exportCSV } from '../export/route'
import { POST as sendInvites } from '../send-invites/route'
import { requireAdmin } from '@/lib/auth/admin'
import { WaitlistService } from '@/lib/services/WaitlistService'
import { EmailService } from '@/lib/email/EmailService'
import { createServiceRoleClient } from '@/lib/supabase/server'

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>
const mockWaitlistService = WaitlistService as jest.Mocked<typeof WaitlistService>
const mockEmailService = EmailService as jest.Mocked<typeof EmailService>
const mockCreateServiceRoleClient = createServiceRoleClient as jest.MockedFunction<typeof createServiceRoleClient>

describe('Admin Waitlist API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/waitlist', () => {
    it('should return all waitlist entries for admin', async () => {
      // Mock admin check passes
      mockRequireAdmin.mockResolvedValue(undefined)
      
      // Mock waitlist data
      const mockEntries = [
        {
          id: '1',
          email: 'user1@test.com',
          created_at: '2024-01-01T00:00:00Z',
          invited_at: null,
          converted_at: null
        },
        {
          id: '2',
          email: 'user2@test.com',
          created_at: '2024-01-02T00:00:00Z',
          invited_at: '2024-01-03T00:00:00Z',
          converted_at: null
        }
      ]
      
      mockWaitlistService.getAllEntries.mockResolvedValue(mockEntries as any)
      
      const response = await getWaitlist()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.entries).toEqual(mockEntries)
      expect(mockRequireAdmin).toHaveBeenCalled()
      expect(mockWaitlistService.getAllEntries).toHaveBeenCalled()
    })

    it('should return 403 for non-admin users', async () => {
      // Mock admin check fails
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))
      
      const response = await getWaitlist()
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toContain('Unauthorized')
      expect(mockWaitlistService.getAllEntries).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      mockWaitlistService.getAllEntries.mockRejectedValue(new Error('Database error'))
      
      const response = await getWaitlist()
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('POST /api/admin/waitlist/invite', () => {
    it('should mark entries as invited for admin', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      mockWaitlistService.markAsInvited.mockResolvedValue(undefined)
      
      const emails = ['user1@test.com', 'user2@test.com']
      const request = new NextRequest('http://localhost/api/admin/waitlist/invite', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })
      
      const response = await markInvited(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('2')
      expect(mockWaitlistService.markAsInvited).toHaveBeenCalledWith(emails)
    })

    it('should return 403 for non-admin users', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/invite', {
        method: 'POST',
        body: JSON.stringify({ emails: ['test@test.com'] })
      })
      
      const response = await markInvited(request)
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toContain('Unauthorized')
    })

    it('should return 400 for invalid request body', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/invite', {
        method: 'POST',
        body: JSON.stringify({ emails: [] })
      })
      
      const response = await markInvited(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid request')
    })

    it('should return 400 for missing emails', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/invite', {
        method: 'POST',
        body: JSON.stringify({})
      })
      
      const response = await markInvited(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid request')
    })
  })

  describe('GET /api/admin/waitlist/export', () => {
    it('should generate CSV for admin', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      
      const mockCSV = 'email,created_at,invited_at\nuser1@test.com,2024-01-01,\nuser2@test.com,2024-01-02,2024-01-03'
      mockWaitlistService.exportToCSV.mockResolvedValue(mockCSV)
      
      const response = await exportCSV()
      const text = await response.text()
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment')
      expect(text).toBe(mockCSV)
      expect(mockWaitlistService.exportToCSV).toHaveBeenCalled()
    })

    it('should return 403 for non-admin users', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))
      
      const response = await exportCSV()
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toContain('Unauthorized')
      expect(mockWaitlistService.exportToCSV).not.toHaveBeenCalled()
    })

    it('should handle export errors gracefully', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      mockWaitlistService.exportToCSV.mockRejectedValue(new Error('Export failed'))
      
      const response = await exportCSV()
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('POST /api/admin/waitlist/send-invites', () => {
    it('should send emails and update status for admin', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      
      const emails = ['user1@test.com', 'user2@test.com', 'user3@test.com']
      
      // Mock markAsInvited
      mockWaitlistService.markAsInvited.mockResolvedValue(undefined)
      
      // Mock database query for invite codes
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            { email: 'user1@test.com', invite_code: 'INV-ABC12345' },
            { email: 'user2@test.com', invite_code: 'INV-DEF67890' },
            { email: 'user3@test.com', invite_code: 'INV-GHI11111' }
          ],
          error: null
        })
      }
      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)
      
      // Mock email service - 2 succeed, 1 fails
      mockEmailService.sendBulkInvites.mockResolvedValue({
        successful: ['user1@test.com', 'user2@test.com'],
        failed: [{ email: 'user3@test.com', error: 'Invalid email' }]
      })
      
      mockWaitlistService.recordEmailSent.mockResolvedValue(undefined)
      mockWaitlistService.markEmailFailed.mockResolvedValue(undefined)
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/send-invites', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })
      
      const response = await sendInvites(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.sent).toBe(2)
      expect(data.failed).toBe(1)
      expect(data.failures).toHaveLength(1)
      
      expect(mockWaitlistService.markAsInvited).toHaveBeenCalledWith(emails)
      expect(mockEmailService.sendBulkInvites).toHaveBeenCalledWith([
        { email: 'user1@test.com', inviteCode: 'INV-ABC12345' },
        { email: 'user2@test.com', inviteCode: 'INV-DEF67890' },
        { email: 'user3@test.com', inviteCode: 'INV-GHI11111' }
      ])
      expect(mockWaitlistService.recordEmailSent).toHaveBeenCalledWith(['user1@test.com', 'user2@test.com'])
      expect(mockWaitlistService.markEmailFailed).toHaveBeenCalledWith(['user3@test.com'])
    })

    it('should handle all successful sends', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      
      const emails = ['user1@test.com', 'user2@test.com']
      
      // Mock markAsInvited
      mockWaitlistService.markAsInvited.mockResolvedValue(undefined)
      
      // Mock database query for invite codes
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            { email: 'user1@test.com', invite_code: 'INV-ABC12345' },
            { email: 'user2@test.com', invite_code: 'INV-DEF67890' }
          ],
          error: null
        })
      }
      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)
      
      mockEmailService.sendBulkInvites.mockResolvedValue({
        successful: emails,
        failed: []
      })
      
      mockWaitlistService.recordEmailSent.mockResolvedValue(undefined)
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/send-invites', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })
      
      const response = await sendInvites(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.sent).toBe(2)
      expect(data.failed).toBe(0)
      expect(mockWaitlistService.recordEmailSent).toHaveBeenCalledWith(emails)
      expect(mockWaitlistService.markEmailFailed).not.toHaveBeenCalled()
    })

    it('should handle all failed sends', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      
      const emails = ['user1@test.com', 'user2@test.com']
      
      // Mock markAsInvited
      mockWaitlistService.markAsInvited.mockResolvedValue(undefined)
      
      // Mock database query for invite codes
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            { email: 'user1@test.com', invite_code: 'INV-ABC12345' },
            { email: 'user2@test.com', invite_code: 'INV-DEF67890' }
          ],
          error: null
        })
      }
      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)
      
      mockEmailService.sendBulkInvites.mockResolvedValue({
        successful: [],
        failed: [
          { email: 'user1@test.com', error: 'Error 1' },
          { email: 'user2@test.com', error: 'Error 2' }
        ]
      })
      
      mockWaitlistService.markEmailFailed.mockResolvedValue(undefined)
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/send-invites', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })
      
      const response = await sendInvites(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.sent).toBe(0)
      expect(data.failed).toBe(2)
      expect(mockWaitlistService.recordEmailSent).not.toHaveBeenCalled()
      expect(mockWaitlistService.markEmailFailed).toHaveBeenCalledWith(emails)
    })

    it('should return 403 for non-admin users', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/send-invites', {
        method: 'POST',
        body: JSON.stringify({ emails: ['test@test.com'] })
      })
      
      const response = await sendInvites(request)
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.error).toContain('Unauthorized')
      expect(mockEmailService.sendBulkInvites).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid request body', async () => {
      mockRequireAdmin.mockResolvedValue(undefined)
      
      const request = new NextRequest('http://localhost/api/admin/waitlist/send-invites', {
        method: 'POST',
        body: JSON.stringify({ emails: [] })
      })
      
      const response = await sendInvites(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid request')
    })
  })
})
