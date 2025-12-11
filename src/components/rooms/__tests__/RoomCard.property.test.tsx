/**
 * Property-based tests for RoomCard component
 * Feature: study-rooms, Property 3: Room list contains required fields
 * Validates: Requirements 2.2
 */

import { render, screen, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import RoomCard from '../RoomCard'
import { RoomListItem, BackgroundTheme } from '@/lib/types/rooms'

afterEach(() => {
  cleanup()
})

// Arbitraries for generating test data
const backgroundThemeArb = fc.constantFrom<BackgroundTheme>(
  'forest',
  'library',
  'cafe',
  'space',
  'ocean'
)

const roomListItemArb = fc.record<RoomListItem>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  backgroundTheme: backgroundThemeArb,
  memberCount: fc.integer({ min: 1, max: 100 }),
  onlineCount: fc.integer({ min: 0, max: 100 }),
  lastActivityAt: fc.integer({ min: Date.now() - 86400000 * 30, max: Date.now() }).map((ts) => new Date(ts).toISOString()),
  createdAt: fc.integer({ min: Date.now() - 86400000 * 365, max: Date.now() }).map((ts) => new Date(ts).toISOString()),
  isCreator: fc.boolean(),
})

describe('RoomCard Property Tests', () => {
  /**
   * Property 3: Room list contains required fields
   * For any room in the user's room list, the display data should include
   * room name, member count, online member count, and last activity timestamp.
   */
  it('should display all required fields for any room', () => {
    fc.assert(
      fc.property(roomListItemArb, (room) => {
        const { container, unmount } = render(<RoomCard room={room} />)

        try {
          // Room name should be displayed
          expect(container.textContent).toContain(room.name)

          // Member count should be displayed
          const memberText = room.memberCount === 1 ? 'member' : 'members'
          expect(container.textContent).toMatch(new RegExp(`${room.memberCount}.*${memberText}`))

          // Online count should be displayed if > 0
          if (room.onlineCount > 0) {
            expect(container.textContent).toMatch(new RegExp(`${room.onlineCount}.*online`))
          }

          // Last activity timestamp should be displayed (as relative time)
          expect(container.textContent).toMatch(/Active.*(ago|in)/)

          // Should have a link to the room
          const link = container.querySelector(`a[href="/rooms/${room.id}"]`)
          expect(link).toBeInTheDocument()

          // Creator badge should be displayed if isCreator is true
          if (room.isCreator) {
            expect(container.textContent).toContain('Creator')
          }
        } finally {
          unmount()
        }
      }),
      { numRuns: 100 }
    )
  })

  it('should handle edge case: single member', () => {
    fc.assert(
      fc.property(
        roomListItemArb.map((room) => ({ ...room, memberCount: 1 })),
        (room) => {
          const { container } = render(<RoomCard room={room} />)
          const memberText = container.textContent
          expect(memberText).toMatch(/1\s+member/)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle edge case: no online members', () => {
    fc.assert(
      fc.property(
        roomListItemArb.map((room) => ({ ...room, onlineCount: 0 })),
        (room) => {
          render(<RoomCard room={room} />)
          expect(screen.queryByText(/online/)).not.toBeInTheDocument()
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should display correct background theme preview', () => {
    fc.assert(
      fc.property(roomListItemArb, (room) => {
        const { container } = render(<RoomCard room={room} />)
        const bgElement = container.querySelector(`[style*="${room.backgroundTheme}.jpg"]`)
        expect(bgElement).toBeInTheDocument()
      }),
      { numRuns: 100 }
    )
  })
})
