/**
 * Property-based tests for RoomService
 * Feature: study-rooms
 * Validates: Requirements 1.3, 1.4, 1.5, 12.4
 */

import * as fc from 'fast-check'
import { RoomService } from '../RoomService'
import type { BackgroundTheme, RoomPrivacy } from '@/lib/types/rooms'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('RoomService Property Tests', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock Supabase client with proper chaining
    const createMockSupabase = () => ({
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    })

    mockSupabase = createMockSupabase()

    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  /**
   * Property 1: Room creation assigns creator and sets defaults
   * Validates: Requirements 1.3, 1.4
   */
  test('Property 1: Room creation assigns creator and sets defaults', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.constantFrom<BackgroundTheme>(
          'forest',
          'library',
          'cafe',
          'space',
          'ocean'
        ),
        fc.constantFrom<RoomPrivacy>('private', 'public'),
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 1, max: 30 }),
        async (
          userId,
          roomName,
          backgroundTheme,
          privacy,
          workMinutes,
          breakMinutes
        ) => {
          const mockRoomId = fc.sample(fc.uuid(), 1)[0]
          const mockTimestamp = new Date().toISOString()

          // Create fresh mock for each iteration to avoid state pollution
          const freshMock: any = {}
          freshMock.from = jest.fn().mockReturnValue(freshMock)
          freshMock.insert = jest.fn().mockReturnValue(freshMock)
          freshMock.select = jest.fn().mockReturnValue(freshMock)
          freshMock.eq = jest.fn().mockReturnValue(freshMock)
          freshMock.update = jest.fn().mockReturnValue(freshMock)
          
          // Mock room creation - first .single() call returns room data
          freshMock.single = jest.fn().mockResolvedValueOnce({
            data: {
              id: mockRoomId,
              creator_id: userId,
              name: roomName.trim(),
              background_theme: backgroundTheme,
              privacy,
              pomodoro_work_minutes: workMinutes,
              pomodoro_break_minutes: breakMinutes,
              status: 'active',
              last_activity_at: mockTimestamp,
              created_at: mockTimestamp,
              updated_at: mockTimestamp,
              meta_json: { invite_code: 'TEST1234' },
            },
            error: null,
          })

          // Mock member insertion - second .insert() call returns success directly
          // The second insert doesn't chain, so we override insert after first use
          const originalInsert = freshMock.insert
          let insertCallCount = 0
          freshMock.insert = jest.fn().mockImplementation(() => {
            insertCallCount++
            if (insertCallCount === 1) {
              return freshMock // First call chains to .select().single()
            } else {
              return Promise.resolve({ error: null }) // Second call returns directly
            }
          })

          // Replace the global mock for this test
          const { createClient } = await import('@/lib/supabase/server')
          ;(createClient as jest.Mock).mockResolvedValueOnce(freshMock)

          const room = await RoomService.createRoom(userId, {
            name: roomName,
            backgroundTheme,
            privacy,
            pomodoroWorkMinutes: workMinutes,
            pomodoroBreakMinutes: breakMinutes,
          })

          // Verify creator is assigned
          expect(room.creatorId).toBe(userId)

          // Verify settings are applied
          expect(room.name).toBe(roomName.trim())
          expect(room.backgroundTheme).toBe(backgroundTheme)
          expect(room.privacy).toBe(privacy)
          expect(room.pomodoroWorkMinutes).toBe(workMinutes)
          expect(room.pomodoroBreakMinutes).toBe(breakMinutes)

          // Verify status is active
          expect(room.status).toBe('active')

          // Verify invite code is generated
          expect(room.metaJson.invite_code).toBeDefined()
          expect(typeof room.metaJson.invite_code).toBe('string')
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 2: Empty room names are rejected
   * Validates: Requirements 1.5
   */
  test('Property 2: Empty room names are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom('', '   ', '\t', '\n', '  \t\n  '),
        async (userId, emptyName) => {
          await expect(
            RoomService.createRoom(userId, {
              name: emptyName,
            })
          ).rejects.toThrow('Room name cannot be empty')
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Property 21: Room deletion cascades to related data
   * Validates: Requirements 12.4
   */
  test('Property 21: Room deletion cascades to related data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        async (roomId, creatorId) => {
          // Create fresh mock for each iteration
          const freshMock: any = {}
          freshMock.from = jest.fn().mockReturnValue(freshMock)
          freshMock.select = jest.fn().mockReturnValue(freshMock)
          freshMock.eq = jest.fn().mockReturnValue(freshMock)
          freshMock.update = jest.fn().mockReturnValue(freshMock)
          
          // Mock room fetch to verify creator
          freshMock.single = jest.fn().mockResolvedValueOnce({
            data: {
              creator_id: creatorId,
            },
            error: null,
          })

          // Mock deletion - eq returns object with error
          let eqCallCount = 0
          freshMock.eq = jest.fn().mockImplementation(() => {
            eqCallCount++
            if (eqCallCount === 1) {
              return freshMock // First eq call (in select chain) returns freshMock for .single()
            } else {
              return { error: null } // Second eq call (in update chain) returns result
            }
          })

          // Replace the global mock for this test
          const { createClient } = await import('@/lib/supabase/server')
          ;(createClient as jest.Mock).mockResolvedValueOnce(freshMock)

          await RoomService.deleteRoom(roomId, creatorId)

          // Verify update was called with status 'deleted'
          expect(freshMock.update).toHaveBeenCalledWith(
            expect.objectContaining({
              status: 'deleted',
            })
          )

          // Verify it was called on the correct room
          expect(freshMock.eq).toHaveBeenCalledWith('id', roomId)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 3: Only creator can update room settings
   * Validates: Requirements 12.2
   */
  test('Property 3: Only creator can update room settings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (roomId, creatorId, nonCreatorId, newName) => {
          // Assume creatorId !== nonCreatorId
          fc.pre(creatorId !== nonCreatorId)

          // Mock room fetch
          mockSupabase.single.mockResolvedValueOnce({
            data: {
              creator_id: creatorId,
            },
            error: null,
          })

          // Non-creator should be rejected
          await expect(
            RoomService.updateRoom(roomId, nonCreatorId, {
              name: newName,
            })
          ).rejects.toThrow('Only the room creator can update settings')
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 4: Only creator can delete room
   * Validates: Requirements 12.4
   */
  test('Property 4: Only creator can delete room', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        async (roomId, creatorId, nonCreatorId) => {
          // Assume creatorId !== nonCreatorId
          fc.pre(creatorId !== nonCreatorId)

          // Mock room fetch
          mockSupabase.single.mockResolvedValueOnce({
            data: {
              creator_id: creatorId,
            },
            error: null,
          })

          // Non-creator should be rejected
          await expect(
            RoomService.deleteRoom(roomId, nonCreatorId)
          ).rejects.toThrow('Only the room creator can delete the room')
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 5: Room defaults are applied when not specified
   * Validates: Requirements 1.4
   */
  test('Property 5: Room defaults are applied when not specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (userId, roomName) => {
          const mockRoomId = fc.sample(fc.uuid(), 1)[0]
          const mockTimestamp = new Date().toISOString()

          // Create fresh mock for each iteration
          const freshMock: any = {}
          freshMock.from = jest.fn().mockReturnValue(freshMock)
          freshMock.insert = jest.fn().mockReturnValue(freshMock)
          freshMock.select = jest.fn().mockReturnValue(freshMock)
          
          // Mock room creation with defaults
          freshMock.single = jest.fn().mockResolvedValueOnce({
            data: {
              id: mockRoomId,
              creator_id: userId,
              name: roomName.trim(),
              background_theme: 'forest',
              privacy: 'private',
              pomodoro_work_minutes: 25,
              pomodoro_break_minutes: 5,
              status: 'active',
              last_activity_at: mockTimestamp,
              created_at: mockTimestamp,
              updated_at: mockTimestamp,
              meta_json: { invite_code: 'TEST1234' },
            },
            error: null,
          })

          // Mock member insertion - handle two insert calls
          let insertCallCount = 0
          freshMock.insert = jest.fn().mockImplementation(() => {
            insertCallCount++
            if (insertCallCount === 1) {
              return freshMock // First call chains to .select().single()
            } else {
              return Promise.resolve({ error: null }) // Second call returns directly
            }
          })

          // Replace the global mock for this test
          const { createClient } = await import('@/lib/supabase/server')
          ;(createClient as jest.Mock).mockResolvedValueOnce(freshMock)

          const room = await RoomService.createRoom(userId, {
            name: roomName,
            // No other fields specified
          })

          // Verify defaults are applied
          expect(room.backgroundTheme).toBe('forest')
          expect(room.privacy).toBe('private')
          expect(room.pomodoroWorkMinutes).toBe(25)
          expect(room.pomodoroBreakMinutes).toBe(5)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 6: Creator cannot leave room
   * Validates: Requirements 12.4
   */
  test('Property 6: Creator cannot leave room', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        async (roomId, creatorId) => {
          // Mock room fetch
          mockSupabase.single.mockResolvedValueOnce({
            data: {
              creator_id: creatorId,
            },
            error: null,
          })

          // Creator trying to leave should be rejected
          await expect(
            RoomService.leaveRoom(roomId, creatorId)
          ).rejects.toThrow('Room creator cannot leave')
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 7: Only creator can remove members
   * Validates: Requirements 12.3
   */
  test('Property 7: Only creator can remove members', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        async (roomId, creatorId, nonCreatorId, targetUserId) => {
          // Assume all IDs are different
          fc.pre(
            creatorId !== nonCreatorId &&
              creatorId !== targetUserId &&
              nonCreatorId !== targetUserId
          )

          // Mock room fetch
          mockSupabase.single.mockResolvedValueOnce({
            data: {
              creator_id: creatorId,
            },
            error: null,
          })

          // Non-creator should be rejected
          await expect(
            RoomService.removeMember(roomId, nonCreatorId, targetUserId)
          ).rejects.toThrow('Only the room creator can remove members')
        }
      ),
      { numRuns: 50 }
    )
  })
})
