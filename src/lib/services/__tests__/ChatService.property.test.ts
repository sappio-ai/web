/**
 * Property-based tests for ChatService
 * Feature: study-rooms
 * Validates: Requirements 6.2, 10.5
 */

import * as fc from 'fast-check'
import { ChatService } from '../ChatService'
import type { MessageType, ToolType } from '@/lib/types/rooms'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('ChatService Property Tests', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
    }

    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  /**
   * Property 8: Chat messages contain required metadata
   * Validates: Requirements 6.2
   */
  test('Property 8: Chat messages contain required metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        fc.constantFrom<MessageType>('text', 'system', 'tool_share', 'completion'),
        async (roomId, userId, content, messageType) => {
          const mockMessageId = fc.sample(fc.uuid(), 1)[0]
          const mockTimestamp = new Date().toISOString()

          // Create fresh mock for each iteration
          const freshMock: any = {}
          freshMock.from = jest.fn().mockReturnValue(freshMock)
          freshMock.select = jest.fn().mockReturnValue(freshMock)
          freshMock.insert = jest.fn().mockReturnValue(freshMock)
          freshMock.update = jest.fn().mockReturnValue(freshMock)
          freshMock.eq = jest.fn().mockReturnValue(freshMock)

          // Mock membership check and message insertion
          freshMock.single = jest.fn()
            .mockResolvedValueOnce({
              data: { id: 'member-id' },
              error: null,
            })
            .mockResolvedValueOnce({
              data: {
                id: mockMessageId,
                room_id: roomId,
                user_id: userId,
                message_type: messageType,
                content: content.trim(),
                tool_type: null,
                tool_id: null,
                tool_name: null,
                created_at: mockTimestamp,
                meta_json: {},
                user: {
                  full_name: 'Test User',
                  avatar_url: 'https://example.com/avatar.jpg',
                },
              },
              error: null,
            })

          // Mock room update - eq returns result
          let eqCallCount = 0
          freshMock.eq = jest.fn().mockImplementation(() => {
            eqCallCount++
            if (eqCallCount <= 2) {
              return freshMock // First two eq calls chain to .single()
            } else {
              return { error: null } // Third eq call (in update chain) returns result
            }
          })

          // Replace the global mock for this test
          const { createClient } = await import('@/lib/supabase/server')
          ;(createClient as jest.Mock).mockResolvedValueOnce(freshMock)

          const message = await ChatService.sendMessage(roomId, userId, {
            content,
            messageType,
          })

          // Verify required metadata is present
          expect(message.id).toBeDefined()
          expect(message.roomId).toBe(roomId)
          expect(message.userId).toBe(userId)
          expect(message.messageType).toBe(messageType)
          expect(message.content).toBe(content.trim())
          expect(message.createdAt).toBeDefined()
          expect(message.metaJson).toBeDefined()

          // Verify user metadata is included
          expect(message.user).toBeDefined()
          expect(message.user?.fullName).toBeDefined()
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 16: Join/leave events create system messages
   * Validates: Requirements 10.5
   */
  test('Property 16: Join/leave events create system messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.constantFrom('joined the room', 'left the room'),
        async (roomId, userId, eventContent) => {
          const mockMessageId = fc.sample(fc.uuid(), 1)[0]
          const mockTimestamp = new Date().toISOString()

          // Mock message insertion
          mockSupabase.single.mockResolvedValueOnce({
            data: {
              id: mockMessageId,
              room_id: roomId,
              user_id: userId,
              message_type: 'system',
              content: eventContent,
              tool_type: null,
              tool_id: null,
              tool_name: null,
              created_at: mockTimestamp,
              meta_json: {},
              user: {
                full_name: 'Test User',
                avatar_url: 'https://example.com/avatar.jpg',
              },
            },
            error: null,
          })

          const message = await ChatService.sendSystemMessage(
            roomId,
            userId,
            eventContent
          )

          // Verify system message properties
          expect(message.messageType).toBe('system')
          expect(message.content).toBe(eventContent)
          expect(message.roomId).toBe(roomId)
          expect(message.userId).toBe(userId)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 9: Tool share messages include tool metadata
   * Validates: Requirements 7.3, 7.4
   */
  test('Property 9: Tool share messages include tool metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.constantFrom<ToolType>('quiz', 'flashcards', 'notes'),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (roomId, userId, toolType, toolId, toolName) => {
          const mockMessageId = fc.sample(fc.uuid(), 1)[0]
          const mockTimestamp = new Date().toISOString()

          // Create fresh mock for each iteration
          const freshMock: any = {}
          freshMock.from = jest.fn().mockReturnValue(freshMock)
          freshMock.select = jest.fn().mockReturnValue(freshMock)
          freshMock.insert = jest.fn().mockReturnValue(freshMock)
          freshMock.update = jest.fn().mockReturnValue(freshMock)
          freshMock.eq = jest.fn().mockReturnValue(freshMock)

          // Mock membership check and message insertion
          freshMock.single = jest.fn()
            .mockResolvedValueOnce({
              data: { id: 'member-id' },
              error: null,
            })
            .mockResolvedValueOnce({
              data: {
                id: mockMessageId,
                room_id: roomId,
                user_id: userId,
                message_type: 'tool_share',
                content: `shared a ${toolType}`,
                tool_type: toolType,
                tool_id: toolId,
                tool_name: toolName,
                created_at: mockTimestamp,
                meta_json: {},
                user: {
                  full_name: 'Test User',
                  avatar_url: 'https://example.com/avatar.jpg',
                },
              },
              error: null,
            })

          // Mock room update - eq returns result
          let eqCallCount = 0
          freshMock.eq = jest.fn().mockImplementation(() => {
            eqCallCount++
            if (eqCallCount <= 2) {
              return freshMock // First two eq calls chain to .single()
            } else {
              return { error: null } // Third eq call (in update chain) returns result
            }
          })

          // Replace the global mock for this test
          const { createClient } = await import('@/lib/supabase/server')
          ;(createClient as jest.Mock).mockResolvedValueOnce(freshMock)

          const message = await ChatService.sendToolShareMessage(
            roomId,
            userId,
            toolType,
            toolId,
            toolName
          )

          // Verify tool share message properties
          expect(message.messageType).toBe('tool_share')
          expect(message.toolType).toBe(toolType)
          expect(message.toolId).toBe(toolId)
          expect(message.toolName).toBe(toolName)
          expect(message.content).toContain(toolType)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 10: Empty messages are rejected
   * Validates: Requirements 6.2
   */
  test('Property 10: Empty messages are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.constantFrom('', '   ', '\t', '\n', '  \t\n  '),
        async (roomId, userId, emptyContent) => {
          // Mock membership check
          mockSupabase.single.mockResolvedValueOnce({
            data: { id: 'member-id' },
            error: null,
          })

          await expect(
            ChatService.sendMessage(roomId, userId, {
              content: emptyContent,
            })
          ).rejects.toThrow('Message content cannot be empty')
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Property 11: Non-members cannot send messages
   * Validates: Requirements 6.1
   */
  test('Property 11: Non-members cannot send messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        async (roomId, userId, content) => {
          // Mock membership check - user is not a member
          mockSupabase.single.mockResolvedValueOnce({
            data: null,
            error: { code: 'PGRST116' },
          })

          await expect(
            ChatService.sendMessage(roomId, userId, {
              content,
            })
          ).rejects.toThrow('User is not a member of this room')
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 12: Completion messages include result metadata
   * Validates: Requirements 8.3
   */
  test('Property 12: Completion messages include result metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        async (roomId, userId, toolName, score, totalQuestions) => {
          const mockMessageId = fc.sample(fc.uuid(), 1)[0]
          const mockTimestamp = new Date().toISOString()
          const result = {
            score,
            totalQuestions,
            correctAnswers: Math.floor((score / 100) * totalQuestions),
          }

          // Mock user fetch
          mockSupabase.single
            .mockResolvedValueOnce({
              data: { full_name: 'Test User' },
              error: null,
            })
            // Mock message insertion
            .mockResolvedValueOnce({
              data: {
                id: mockMessageId,
                room_id: roomId,
                user_id: userId,
                message_type: 'completion',
                content: `Test User completed ${toolName}`,
                tool_type: null,
                tool_id: null,
                tool_name: null,
                created_at: mockTimestamp,
                meta_json: result,
                user: {
                  full_name: 'Test User',
                  avatar_url: 'https://example.com/avatar.jpg',
                },
              },
              error: null,
            })

          const message = await ChatService.sendCompletionMessage(
            roomId,
            userId,
            toolName,
            result
          )

          // Verify completion message properties
          expect(message.messageType).toBe('completion')
          expect(message.content).toContain(toolName)
          expect(message.metaJson).toEqual(result)
          expect(message.metaJson.score).toBe(score)
          expect(message.metaJson.totalQuestions).toBe(totalQuestions)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 13: Message history is paginated correctly
   * Validates: Requirements 6.4
   */
  test('Property 13: Message history is paginated correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 100 }),
        async (roomId, userId, limit) => {
          // Mock membership check
          mockSupabase.single.mockResolvedValueOnce({
            data: { id: 'member-id' },
            error: null,
          })

          // Generate mock messages
          const mockMessages = Array.from({ length: limit }, (_, i) => ({
            id: `msg-${i}`,
            room_id: roomId,
            user_id: userId,
            message_type: 'text',
            content: `Message ${i}`,
            tool_type: null,
            tool_id: null,
            tool_name: null,
            created_at: new Date(Date.now() - i * 1000).toISOString(),
            meta_json: {},
            user: {
              full_name: 'Test User',
              avatar_url: 'https://example.com/avatar.jpg',
            },
          }))

          // Mock message fetch
          mockSupabase.limit.mockResolvedValueOnce({
            data: mockMessages,
            error: null,
          })

          const messages = await ChatService.getMessages(roomId, userId, {
            limit,
          })

          // Verify pagination
          expect(messages.length).toBeLessThanOrEqual(limit)
          expect(mockSupabase.limit).toHaveBeenCalledWith(limit)

          // Verify messages are in chronological order (oldest first)
          for (let i = 1; i < messages.length; i++) {
            const prevTime = new Date(messages[i - 1].createdAt).getTime()
            const currTime = new Date(messages[i].createdAt).getTime()
            expect(currTime).toBeGreaterThanOrEqual(prevTime)
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})
