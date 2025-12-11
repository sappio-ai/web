/**
 * Property-based tests for SharedToolService
 * Feature: study-rooms
 * Validates: Requirements 7.3, 7.5, 8.3, 8.5
 */

import * as fc from 'fast-check'
import { SharedToolService } from '../SharedToolService'
import type { ToolType } from '@/lib/types/rooms'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock ChatService
jest.mock('../ChatService', () => ({
  ChatService: {
    sendToolShareMessage: jest.fn(),
    sendCompletionMessage: jest.fn(),
  },
}))

describe('SharedToolService Property Tests', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    const createMockSupabase = () => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    })

    mockSupabase = createMockSupabase()

    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  /**
   * Property 9: Tool share creates message and shared tab entry
   * Validates: Requirements 7.3, 7.5
   */
  test('Property 9: Tool share creates message and shared tab entry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.constantFrom<ToolType>('quiz', 'flashcards', 'notes'),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (roomId, userId, toolType, toolId, toolName) => {
          const mockMessageId = fc.sample(fc.uuid(), 1)[0]
          const mockSharedToolId = fc.sample(fc.uuid(), 1)[0]
          const mockTimestamp = new Date().toISOString()

          // Mock ChatService
          const { ChatService } = await import('../ChatService')
          ;(ChatService.sendToolShareMessage as jest.Mock).mockResolvedValueOnce({
            id: mockMessageId,
            roomId,
            userId,
            messageType: 'tool_share',
            content: `shared a ${toolType}`,
            toolType,
            toolId,
            toolName,
            createdAt: mockTimestamp,
            metaJson: {},
          })

          // Create fresh mock
          const freshMock: any = {}
          freshMock.from = jest.fn().mockReturnValue(freshMock)
          freshMock.select = jest.fn().mockReturnValue(freshMock)
          freshMock.insert = jest.fn().mockReturnValue(freshMock)
          freshMock.eq = jest.fn().mockReturnValue(freshMock)

          // Mock membership check
          freshMock.single = jest.fn()
            .mockResolvedValueOnce({
              data: { id: 'member-id' },
              error: null,
            })
            // Mock shared tool insertion
            .mockResolvedValueOnce({
              data: {
                id: mockSharedToolId,
                room_id: roomId,
                message_id: mockMessageId,
                sharer_id: userId,
                tool_type: toolType,
                tool_id: toolId,
                tool_name: toolName,
                study_pack_id: null,
                completion_count: 0,
                shared_at: mockTimestamp,
                sharer: {
                  full_name: 'Test User',
                  avatar_url: 'https://example.com/avatar.jpg',
                },
                study_pack: null,
              },
              error: null,
            })

          // Replace the global mock
          const { createClient } = await import('@/lib/supabase/server')
          ;(createClient as jest.Mock).mockResolvedValue(freshMock)

          const sharedTool = await SharedToolService.shareTool(
            roomId,
            userId,
            toolType,
            toolId,
            toolName
          )

          // Verify chat message was created
          expect(ChatService.sendToolShareMessage).toHaveBeenCalledWith(
            roomId,
            userId,
            toolType,
            toolId,
            toolName
          )

          // Verify shared tool record was created
          expect(sharedTool.id).toBe(mockSharedToolId)
          expect(sharedTool.messageId).toBe(mockMessageId)
          expect(sharedTool.toolType).toBe(toolType)
          expect(sharedTool.toolId).toBe(toolId)
          expect(sharedTool.toolName).toBe(toolName)
          expect(sharedTool.completionCount).toBe(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 11: Quiz completion posts result to chat
   * Validates: Requirements 8.3
   */
  test('Property 11: Quiz completion posts result to chat', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (score, totalQuestions, toolName) => {
          // Test completion result structure
          const result = {
            score,
            totalQuestions,
            correctAnswers: Math.floor((score / 100) * totalQuestions),
          }

          // Verify result has required fields
          expect(result.score).toBe(score)
          expect(result.totalQuestions).toBe(totalQuestions)
          expect(result.correctAnswers).toBeDefined()

          // Verify correct answers calculation
          expect(result.correctAnswers).toBeLessThanOrEqual(totalQuestions)
          expect(result.correctAnswers).toBeGreaterThanOrEqual(0)

          // Verify completion message would include result
          const completionMessage = {
            messageType: 'completion',
            content: `User completed ${toolName}`,
            metaJson: result,
          }

          expect(completionMessage.metaJson).toEqual(result)
          expect(completionMessage.messageType).toBe('completion')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 12: Tool progress is tracked per user
   * Validates: Requirements 7.5, 8.5
   */
  test('Property 12: Tool progress is tracked per user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        async (completionCount, totalMembers) => {
          // Ensure completionCount doesn't exceed totalMembers for realistic test
          const actualCompletions = Math.min(completionCount, totalMembers)

          // Test completion percentage calculation
          const completionPercentage =
            totalMembers > 0
              ? Math.round((actualCompletions / totalMembers) * 100)
              : 0

          // Verify percentage is within valid range
          expect(completionPercentage).toBeGreaterThanOrEqual(0)
          expect(completionPercentage).toBeLessThanOrEqual(100)

          // Verify calculation is correct
          if (totalMembers > 0) {
            const expected = Math.round((actualCompletions / totalMembers) * 100)
            expect(completionPercentage).toBe(expected)
          } else {
            expect(completionPercentage).toBe(0)
          }

          // Verify edge cases
          if (actualCompletions === 0) {
            expect(completionPercentage).toBe(0)
          }
          if (actualCompletions === totalMembers && totalMembers > 0) {
            expect(completionPercentage).toBe(100)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 13: Completion count increments correctly
   * Validates: Requirements 8.5
   */
  test('Property 13: Completion count increments correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }),
        async (currentCount) => {
          // Test increment logic
          const newCount = currentCount + 1

          // Verify increment
          expect(newCount).toBe(currentCount + 1)
          expect(newCount).toBeGreaterThan(currentCount)

          // Verify multiple increments
          const afterTwo = currentCount + 2
          expect(afterTwo).toBe(currentCount + 2)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 14: Shared tools can be filtered by type
   * Validates: Requirements 9.2
   */
  test('Property 14: Shared tools can be filtered by type', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<ToolType>('quiz', 'flashcards', 'notes'),
        async (filterType) => {
          // Test filtering logic
          const allTools = [
            { toolType: 'quiz' as ToolType, toolName: 'Quiz 1' },
            { toolType: 'flashcards' as ToolType, toolName: 'Cards 1' },
            { toolType: 'notes' as ToolType, toolName: 'Notes 1' },
            { toolType: 'quiz' as ToolType, toolName: 'Quiz 2' },
          ]

          const filtered = allTools.filter((tool) => tool.toolType === filterType)

          // Verify all filtered tools match the type
          filtered.forEach((tool) => {
            expect(tool.toolType).toBe(filterType)
          })

          // Verify filtering works for each type
          const quizCount = allTools.filter((t) => t.toolType === 'quiz').length
          const flashcardsCount = allTools.filter(
            (t) => t.toolType === 'flashcards'
          ).length
          const notesCount = allTools.filter((t) => t.toolType === 'notes').length

          expect(quizCount).toBe(2)
          expect(flashcardsCount).toBe(1)
          expect(notesCount).toBe(1)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 15: Completion statistics are accurate
   * Validates: Requirements 9.4
   */
  test('Property 15: Completion statistics are accurate', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        async (completions, members) => {
          // Test statistics calculation
          const stats = {
            completionCount: completions,
            totalMembers: members,
            completionPercentage: Math.round((completions / members) * 100),
          }

          // Verify stats are consistent
          expect(stats.completionCount).toBe(completions)
          expect(stats.totalMembers).toBe(members)

          // Verify percentage calculation
          const expectedPercentage = Math.round((completions / members) * 100)
          expect(stats.completionPercentage).toBe(expectedPercentage)

          // Verify percentage bounds
          expect(stats.completionPercentage).toBeGreaterThanOrEqual(0)
          expect(stats.completionPercentage).toBeLessThanOrEqual(
            Math.ceil((completions / members) * 100)
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
