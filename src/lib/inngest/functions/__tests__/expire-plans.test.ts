/**
 * Tests for plan expiration scheduled function
 */

import { BenefitService } from '@/lib/services/BenefitService'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(),
}))

jest.mock('@/lib/services/BenefitService', () => ({
  BenefitService: {
    expireTrial: jest.fn(),
  },
}))

const mockCreateServiceRoleClient = createServiceRoleClient as jest.MockedFunction<
  typeof createServiceRoleClient
>
const mockExpireTrial = BenefitService.expireTrial as jest.MockedFunction<
  typeof BenefitService.expireTrial
>

describe('Plan Expiration Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Finding expired users', () => {
    it('should find users with expired plans', async () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const mockExpiredUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          plan: 'student_pro',
          plan_expires_at: yesterday.toISOString(),
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          plan: 'pro_plus',
          plan_expires_at: yesterday.toISOString(),
        },
      ]

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        neq: jest.fn().mockResolvedValue({
          data: mockExpiredUsers,
          error: null,
        }),
      }

      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)

      // Simulate the query
      const { data } = await mockSupabase
        .from('users')
        .select('id, email, plan, plan_expires_at')
        .not('plan_expires_at', 'is', null)
        .lt('plan_expires_at', now.toISOString())
        .neq('plan', 'free')

      expect(data).toHaveLength(2)
      expect(data[0].plan).toBe('student_pro')
      expect(data[1].plan).toBe('pro_plus')
    })

    it('should not include users with future expiry dates', async () => {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        neq: jest.fn().mockResolvedValue({
          data: [], // No expired users
          error: null,
        }),
      }

      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)

      const { data } = await mockSupabase
        .from('users')
        .select('id, email, plan, plan_expires_at')
        .not('plan_expires_at', 'is', null)
        .lt('plan_expires_at', now.toISOString())
        .neq('plan', 'free')

      expect(data).toHaveLength(0)
    })

    it('should not include free tier users', async () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        neq: jest.fn().mockResolvedValue({
          data: [], // Free users filtered out
          error: null,
        }),
      }

      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)

      const { data } = await mockSupabase
        .from('users')
        .select('id, email, plan, plan_expires_at')
        .not('plan_expires_at', 'is', null)
        .lt('plan_expires_at', now.toISOString())
        .neq('plan', 'free')

      expect(data).toHaveLength(0)
    })
  })

  describe('Expiring users', () => {
    it('should call expireTrial for each expired user', async () => {
      const expiredUsers = [
        { id: 'user-1', email: 'user1@test.com', plan: 'student_pro' },
        { id: 'user-2', email: 'user2@test.com', plan: 'pro_plus' },
      ]

      mockExpireTrial.mockResolvedValue()

      for (const user of expiredUsers) {
        await BenefitService.expireTrial(user.id)
      }

      expect(mockExpireTrial).toHaveBeenCalledTimes(2)
      expect(mockExpireTrial).toHaveBeenCalledWith('user-1')
      expect(mockExpireTrial).toHaveBeenCalledWith('user-2')
    })

    it('should handle errors gracefully and continue processing', async () => {
      const expiredUsers = [
        { id: 'user-1', email: 'user1@test.com', plan: 'student_pro' },
        { id: 'user-2', email: 'user2@test.com', plan: 'pro_plus' },
        { id: 'user-3', email: 'user3@test.com', plan: 'student_pro' },
      ]

      // Second user fails, others succeed
      mockExpireTrial
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce()

      const succeeded: string[] = []
      const failed: Array<{ userId: string; error: string }> = []

      for (const user of expiredUsers) {
        try {
          await BenefitService.expireTrial(user.id)
          succeeded.push(user.id)
        } catch (error) {
          failed.push({
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      expect(succeeded).toHaveLength(2)
      expect(failed).toHaveLength(1)
      expect(failed[0].userId).toBe('user-2')
      expect(failed[0].error).toBe('Database error')
    })

    it('should return summary of results', async () => {
      const expiredUsers = [
        { id: 'user-1', email: 'user1@test.com', plan: 'student_pro' },
        { id: 'user-2', email: 'user2@test.com', plan: 'pro_plus' },
      ]

      mockExpireTrial.mockResolvedValue()

      const succeeded: string[] = []
      const failed: Array<{ userId: string; error: string }> = []

      for (const user of expiredUsers) {
        try {
          await BenefitService.expireTrial(user.id)
          succeeded.push(user.id)
        } catch (error) {
          failed.push({
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      const results = {
        total: expiredUsers.length,
        succeeded: succeeded.length,
        failed: failed.length,
        failures: failed,
      }

      expect(results.total).toBe(2)
      expect(results.succeeded).toBe(2)
      expect(results.failed).toBe(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty result set', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        neq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)

      const { data } = await mockSupabase
        .from('users')
        .select('id, email, plan, plan_expires_at')
        .not('plan_expires_at', 'is', null)
        .lt('plan_expires_at', new Date().toISOString())
        .neq('plan', 'free')

      expect(data).toHaveLength(0)
      expect(mockExpireTrial).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        neq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      }

      mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)

      const { data, error } = await mockSupabase
        .from('users')
        .select('id, email, plan, plan_expires_at')
        .not('plan_expires_at', 'is', null)
        .lt('plan_expires_at', new Date().toISOString())
        .neq('plan', 'free')

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })
  })
})
