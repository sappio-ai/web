/**
 * Integration tests for quiz modes
 * Feature: pricing-tier-implementation
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { NextRequest } from 'next/server'
import { GET as quizHandler } from '../[id]/route'
import { POST as weakTopicsHandler } from '../[id]/weak-topics/route'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'

describe('Quiz Modes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Timed Mode - Free User Blocked', () => {
    const mockQuiz = {
      id: 'test-quiz',
      study_pack_id: 'test-pack',
      quiz_items: [
        { id: '1', question: 'Q1', answer: 'A1', topic: 'Topic 1' },
        { id: '2', question: 'Q2', answer: 'A2', topic: 'Topic 2' },
      ],
      study_packs: {
        user_id: 'free-user-id',
        users: {
          auth_user_id: 'auth-free-user',
        },
      },
    }

    beforeEach(() => {
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'auth-free-user' } },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { plan: 'free' },
                    error: null,
                  }),
                }),
              }),
            }
          } else if (table === 'quizzes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: mockQuiz,
                  error: null,
                }),
              }),
            }
          }
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }
        }),
      })
    })

    test('Free user blocked from timed mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes/test-quiz?mode=timed')
      const response = await quizHandler(request, { params: Promise.resolve({ id: 'test-quiz' }) })

      expect(response.status).toBe(403)

      const data = await response.json()
      expect(data).toEqual({
        error: 'Timed quiz mode requires Student Pro or Pro plan',
        code: 'PLAN_UPGRADE_REQUIRED',
        currentPlan: 'free',
        requiredPlan: 'student_pro',
      })
    })

    test('Free user can access normal mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes/test-quiz')
      const response = await quizHandler(request, { params: Promise.resolve({ id: 'test-quiz' }) })

      expect(response.status).not.toBe(403)
      expect(response.status).toBe(200)
    })
  })

  describe('Weak Topics - Free User Blocked', () => {
    const mockQuiz = {
      id: 'test-quiz',
      study_pack_id: 'test-pack',
      quiz_items: [
        { id: '1', question: 'Q1', answer: 'A1', topic: 'Topic 1' },
        { id: '2', question: 'Q2', answer: 'A2', topic: 'Topic 2' },
      ],
      study_packs: {
        user_id: 'free-user-id',
        users: {
          auth_user_id: 'auth-free-user',
        },
      },
    }

    beforeEach(() => {
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'auth-free-user' } },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { plan: 'free' },
                    error: null,
                  }),
                }),
              }),
            }
          } else if (table === 'quizzes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: mockQuiz,
                  error: null,
                }),
              }),
            }
          }
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }
        }),
      })
    })

    test('Free user blocked from weak topics', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes/test-quiz/weak-topics', {
        method: 'POST',
        body: JSON.stringify({ weakTopics: ['Topic 1'] }),
      })
      const response = await weakTopicsHandler(request, { params: Promise.resolve({ id: 'test-quiz' }) })

      expect(response.status).toBe(403)

      const data = await response.json()
      expect(data).toEqual({
        error: 'Weak topics practice requires Student Pro or Pro plan',
        code: 'PLAN_UPGRADE_REQUIRED',
        currentPlan: 'free',
        requiredPlan: 'student_pro',
      })
    })
  })

  describe('Student Pro User - Allowed Both Modes', () => {
    const mockQuiz = {
      id: 'test-quiz',
      study_pack_id: 'test-pack',
      quiz_items: [
        { id: '1', question: 'Q1', answer: 'A1', topic: 'Topic 1' },
        { id: '2', question: 'Q2', answer: 'A2', topic: 'Topic 2' },
      ],
      study_packs: {
        user_id: 'student-user-id',
        users: {
          auth_user_id: 'auth-student-user',
        },
      },
    }

    beforeEach(() => {
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'auth-student-user' } },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { plan: 'student_pro' },
                    error: null,
                  }),
                }),
              }),
            }
          } else if (table === 'quizzes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: mockQuiz,
                  error: null,
                }),
              }),
            }
          }
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }
        }),
      })
    })

    test('Student Pro user can use timed mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes/test-quiz?mode=timed')
      const response = await quizHandler(request, { params: Promise.resolve({ id: 'test-quiz' }) })

      expect(response.status).not.toBe(403)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.quiz).toBeDefined()
      expect(data.quiz.items).toHaveLength(2)
    })

    test('Student Pro user can use weak topics', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes/test-quiz/weak-topics', {
        method: 'POST',
        body: JSON.stringify({ weakTopics: ['Topic 1'] }),
      })
      const response = await weakTopicsHandler(request, { params: Promise.resolve({ id: 'test-quiz' }) })

      expect(response.status).not.toBe(403)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.quiz).toBeDefined()
      expect(data.quiz.isWeakTopicQuiz).toBe(true)
      expect(data.quiz.weakTopics).toEqual(['Topic 1'])
    })
  })

  describe('Pro User - Allowed Both Modes', () => {
    const mockQuiz = {
      id: 'test-quiz',
      study_pack_id: 'test-pack',
      quiz_items: [
        { id: '1', question: 'Q1', answer: 'A1', topic: 'Topic 1' },
        { id: '2', question: 'Q2', answer: 'A2', topic: 'Topic 2' },
      ],
      study_packs: {
        user_id: 'pro-user-id',
        users: {
          auth_user_id: 'auth-pro-user',
        },
      },
    }

    beforeEach(() => {
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'auth-pro-user' } },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { plan: 'pro_plus' },
                    error: null,
                  }),
                }),
              }),
            }
          } else if (table === 'quizzes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: mockQuiz,
                  error: null,
                }),
              }),
            }
          }
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }
        }),
      })
    })

    test('Pro user can use timed mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes/test-quiz?mode=timed')
      const response = await quizHandler(request, { params: Promise.resolve({ id: 'test-quiz' }) })

      expect(response.status).not.toBe(403)
      expect(response.status).toBe(200)
    })

    test('Pro user can use weak topics', async () => {
      const request = new NextRequest('http://localhost:3000/api/quizzes/test-quiz/weak-topics', {
        method: 'POST',
        body: JSON.stringify({ weakTopics: ['Topic 1'] }),
      })
      const response = await weakTopicsHandler(request, { params: Promise.resolve({ id: 'test-quiz' }) })

      expect(response.status).not.toBe(403)
      expect(response.status).toBe(200)
    })
  })

  describe('Error Response Structure Validation', () => {
    test('Both endpoints return consistent error structure for free users', async () => {
      const mockQuiz = {
        id: 'test-quiz',
        study_pack_id: 'test-pack',
        quiz_items: [{ id: '1', question: 'Q1', answer: 'A1', topic: 'Topic 1' }],
        study_packs: {
          user_id: 'free-user-id',
          users: { auth_user_id: 'auth-free-user' },
        },
      }

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'auth-free-user' } },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { plan: 'free' },
                    error: null,
                  }),
                }),
              }),
            }
          } else if (table === 'quizzes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: mockQuiz,
                  error: null,
                }),
              }),
            }
          }
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }
        }),
      })

      // Test timed mode error structure
      const timedRequest = new NextRequest('http://localhost:3000/api/quizzes/test-quiz?mode=timed')
      const timedResponse = await quizHandler(timedRequest, { params: Promise.resolve({ id: 'test-quiz' }) })
      const timedData = await timedResponse.json()

      expect(timedData).toHaveProperty('error')
      expect(timedData).toHaveProperty('code')
      expect(timedData).toHaveProperty('currentPlan')
      expect(timedData).toHaveProperty('requiredPlan')
      expect(timedData.code).toBe('PLAN_UPGRADE_REQUIRED')
      expect(timedData.currentPlan).toBe('free')
      expect(timedData.requiredPlan).toBe('student_pro')

      // Test weak topics error structure
      const weakTopicsRequest = new NextRequest('http://localhost:3000/api/quizzes/test-quiz/weak-topics', {
        method: 'POST',
        body: JSON.stringify({ weakTopics: ['Topic 1'] }),
      })
      const weakTopicsResponse = await weakTopicsHandler(weakTopicsRequest, { params: Promise.resolve({ id: 'test-quiz' }) })
      const weakTopicsData = await weakTopicsResponse.json()

      expect(weakTopicsData).toHaveProperty('error')
      expect(weakTopicsData).toHaveProperty('code')
      expect(weakTopicsData).toHaveProperty('currentPlan')
      expect(weakTopicsData).toHaveProperty('requiredPlan')
      expect(weakTopicsData.code).toBe('PLAN_UPGRADE_REQUIRED')
      expect(weakTopicsData.currentPlan).toBe('free')
      expect(weakTopicsData.requiredPlan).toBe('student_pro')
    })
  })
})
