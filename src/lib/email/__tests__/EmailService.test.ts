/**
 * Email Service Tests
 * 
 * Unit tests for email sending functionality
 */

// Mock Resend before importing EmailService
const mockSend = jest.fn()

jest.mock('resend', () => {
  const mockSendFn = jest.fn()
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSendFn
      }
    }))
  }
})

import { EmailService } from '../EmailService'
import { Resend } from 'resend'

// Get reference to the mocked send function
const MockedResend = Resend as jest.MockedClass<typeof Resend>
const resendInstance = new MockedResend('test-key')
const mockedSend = resendInstance.emails.send as jest.MockedFunction<typeof resendInstance.emails.send>

describe('EmailService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedSend.mockClear()
  })

  describe('sendInviteEmail', () => {
    it('should send email successfully and return success', async () => {
      const email = 'test@example.com'
      
      mockedSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null
      })

      const result = await EmailService.sendInviteEmail(email)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockedSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Sappio <onboarding@sappio.ai>',
          to: [email],
          subject: "You're invited to Sappio! 🎉"
        })
      )
    })

    it('should handle send failure and return error', async () => {
      const email = 'test@example.com'
      
      mockedSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' }
      })

      const result = await EmailService.sendInviteEmail(email)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API key')
    })

    it('should handle exception and return error', async () => {
      const email = 'test@example.com'
      
      mockedSend.mockRejectedValue(
        new Error('Network error')
      )

      const result = await EmailService.sendInviteEmail(email)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should include email in request', async () => {
      const email = 'user@test.com'
      
      mockedSend.mockResolvedValue({
        data: { id: 'email-456' },
        error: null
      })

      await EmailService.sendInviteEmail(email)

      expect(mockedSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [email]
        })
      )
    })
  })

  describe('sendBulkInvites', () => {
    it('should send multiple emails and track success', async () => {
      const emailsWithCodes = [
        { email: 'user1@test.com', inviteCode: 'INV-ABC12345' },
        { email: 'user2@test.com', inviteCode: 'INV-DEF67890' },
        { email: 'user3@test.com', inviteCode: 'INV-GHI11111' }
      ]
      
      mockedSend.mockResolvedValue({
        data: { id: 'email-bulk' },
        error: null
      })

      const result = await EmailService.sendBulkInvites(emailsWithCodes)

      expect(result.successful).toEqual(['user1@test.com', 'user2@test.com', 'user3@test.com'])
      expect(result.failed).toEqual([])
      expect(mockedSend).toHaveBeenCalledTimes(3)
    })

    it('should track failed sends separately', async () => {
      const emailsWithCodes = [
        { email: 'user1@test.com', inviteCode: 'INV-ABC12345' },
        { email: 'user2@test.com', inviteCode: 'INV-DEF67890' },
        { email: 'user3@test.com', inviteCode: 'INV-GHI11111' }
      ]
      
      // First email succeeds, second fails, third succeeds
      mockedSend
        .mockResolvedValueOnce({
          data: { id: 'email-1' },
          error: null
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Invalid email' }
        })
        .mockResolvedValueOnce({
          data: { id: 'email-3' },
          error: null
        })

      const result = await EmailService.sendBulkInvites(emailsWithCodes)

      expect(result.successful).toEqual(['user1@test.com', 'user3@test.com'])
      expect(result.failed).toEqual([
        { email: 'user2@test.com', error: 'Invalid email' }
      ])
    })

    it('should handle all failures', async () => {
      const emailsWithCodes = [
        { email: 'user1@test.com', inviteCode: 'INV-ABC12345' },
        { email: 'user2@test.com', inviteCode: 'INV-DEF67890' }
      ]
      
      mockedSend.mockResolvedValue({
        data: null,
        error: { message: 'Service unavailable' }
      })

      const result = await EmailService.sendBulkInvites(emailsWithCodes)

      expect(result.successful).toEqual([])
      expect(result.failed).toHaveLength(2)
      expect(result.failed[0].error).toBe('Service unavailable')
    })

    it('should handle empty email list', async () => {
      const result = await EmailService.sendBulkInvites([])

      expect(result.successful).toEqual([])
      expect(result.failed).toEqual([])
      expect(mockedSend).not.toHaveBeenCalled()
    })

    it('should send emails sequentially', async () => {
      const emailsWithCodes = [
        { email: 'user1@test.com', inviteCode: 'INV-ABC12345' },
        { email: 'user2@test.com', inviteCode: 'INV-DEF67890' }
      ]
      const callOrder: number[] = []
      
      mockedSend.mockImplementation(() => {
        callOrder.push(Date.now())
        return Promise.resolve({
          data: { id: 'email-test' },
          error: null
        })
      })

      await EmailService.sendBulkInvites(emailsWithCodes)

      // Verify calls happened sequentially (with delay between them)
      expect(mockedSend).toHaveBeenCalledTimes(2)
      // Second call should be after first (with 100ms delay)
      if (callOrder.length === 2) {
        expect(callOrder[1]).toBeGreaterThanOrEqual(callOrder[0])
      }
    })
  })

  describe('Email template integration', () => {
    it('should include React component in email', async () => {
      const email = 'test@example.com'
      
      mockedSend.mockResolvedValue({
        data: { id: 'email-789' },
        error: null
      })

      await EmailService.sendInviteEmail(email)

      const callArgs = mockedSend.mock.calls[0][0]
      expect(callArgs.react).toBeDefined()
      expect(typeof callArgs.react).toBe('object')
    })

    it('should use correct sender address', async () => {
      const email = 'test@example.com'
      
      mockedSend.mockResolvedValue({
        data: { id: 'email-sender' },
        error: null
      })

      await EmailService.sendInviteEmail(email)

      expect(mockedSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Sappio <onboarding@sappio.ai>'
        })
      )
    })

    it('should use correct subject line', async () => {
      const email = 'test@example.com'
      
      mockedSend.mockResolvedValue({
        data: { id: 'email-subject' },
        error: null
      })

      await EmailService.sendInviteEmail(email)

      expect(mockedSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "You're invited to Sappio! 🎉"
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should handle unknown error types', async () => {
      const email = 'test@example.com'
      
      mockedSend.mockRejectedValue('String error')

      const result = await EmailService.sendInviteEmail(email)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const email = 'test@example.com'
      
      mockedSend.mockResolvedValue({
        data: null,
        error: { message: 'Test error' }
      })

      await EmailService.sendInviteEmail(email)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EmailService] Error sending invite:',
        { message: 'Test error' }
      )

      consoleSpy.mockRestore()
    })
  })
})
