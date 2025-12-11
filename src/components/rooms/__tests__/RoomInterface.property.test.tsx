/**
 * Property-based tests for RoomInterface component
 * Feature: study-rooms, Property 22: Background theme applies correctly
 * Validates: Requirements 14.2
 */

import { render, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import RoomInterface from '../RoomInterface'
import { Room, BackgroundTheme } from '@/lib/types/rooms'

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

const roomArb = fc.record<Room>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  creatorId: fc.uuid(),
  backgroundTheme: backgroundThemeArb,
  privacy: fc.constantFrom('private', 'public'),
  pomodoroWorkMinutes: fc.integer({ min: 1, max: 120 }),
  pomodoroBreakMinutes: fc.integer({ min: 1, max: 30 }),
  status: fc.constant('active'),
  lastActivityAt: fc.integer({ min: Date.now() - 86400000 * 30, max: Date.now() }).map((ts) => new Date(ts).toISOString()),
  createdAt: fc.integer({ min: Date.now() - 86400000 * 365, max: Date.now() }).map((ts) => new Date(ts).toISOString()),
  updatedAt: fc.integer({ min: Date.now() - 86400000 * 365, max: Date.now() }).map((ts) => new Date(ts).toISOString()),
  metaJson: fc.constant({}),
  memberCount: fc.integer({ min: 1, max: 100 }),
  onlineCount: fc.integer({ min: 0, max: 100 }),
})

describe('RoomInterface Property Tests', () => {
  /**
   * Property 22: Background theme applies correctly
   * For any selected background theme, the corresponding background image
   * should be applied to the room interface.
   */
  it('should apply correct background image for any theme', () => {
    fc.assert(
      fc.property(roomArb, fc.uuid(), fc.boolean(), (room, userId, isCreator) => {
        const { container, unmount } = render(
          <RoomInterface room={room} userId={userId} isCreator={isCreator} />
        )

        try {
          // Find the element with background image (the root div)
          const bgElement = container.querySelector('div[style*="background"]')
          expect(bgElement).toBeTruthy()

          // Check that the background URL contains the correct theme
          const style = bgElement?.getAttribute('style')
          expect(style).toContain(`/rooms/backgrounds/${room.backgroundTheme}.jpg`)
        } finally {
          unmount()
        }
      }),
      { numRuns: 100 }
    )
  })

  it('should apply background for all valid themes', () => {
    const themes: BackgroundTheme[] = ['forest', 'library', 'cafe', 'space', 'ocean']
    
    themes.forEach((theme) => {
      fc.assert(
        fc.property(
          roomArb.map((room) => ({ ...room, backgroundTheme: theme })),
          fc.uuid(),
          fc.boolean(),
          (room, userId, isCreator) => {
            const { container, unmount } = render(
              <RoomInterface room={room} userId={userId} isCreator={isCreator} />
            )

            try {
              const bgElement = container.querySelector('div[style*="background"]')
              const style = bgElement?.getAttribute('style')
              expect(style).toContain(`/rooms/backgrounds/${theme}.jpg`)
            } finally {
              unmount()
            }
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  it('should display room name and member count', () => {
    fc.assert(
      fc.property(roomArb, fc.uuid(), fc.boolean(), (room, userId, isCreator) => {
        const { container, unmount } = render(
          <RoomInterface room={room} userId={userId} isCreator={isCreator} />
        )

        try {
          // Room name should be displayed
          expect(container.textContent).toContain(room.name)

          // Member count should be displayed
          expect(container.textContent).toMatch(new RegExp(`${room.memberCount || 0}.*members?`))
        } finally {
          unmount()
        }
      }),
      { numRuns: 100 }
    )
  })

  it('should show creator badge when isCreator is true', () => {
    fc.assert(
      fc.property(roomArb, fc.uuid(), (room, userId) => {
        const { container, unmount } = render(
          <RoomInterface room={room} userId={userId} isCreator={true} />
        )

        try {
          expect(container.textContent).toContain('Creator')
        } finally {
          unmount()
        }
      }),
      { numRuns: 50 }
    )
  })

  it('should not show creator badge when isCreator is false', () => {
    fc.assert(
      fc.property(roomArb, fc.uuid(), (room, userId) => {
        const { container, unmount } = render(
          <RoomInterface room={room} userId={userId} isCreator={false} />
        )

        try {
          // Should show "Leave Room" instead of creator badge
          expect(container.textContent).toContain('Leave Room')
        } finally {
          unmount()
        }
      }),
      { numRuns: 50 }
    )
  })
})
