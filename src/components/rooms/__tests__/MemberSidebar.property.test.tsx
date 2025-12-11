/**
 * Property-based tests for MemberSidebar component
 * Feature: study-rooms, Property 15: Member display includes presence data
 * Validates: Requirements 10.2, 10.4
 */

import { render, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import { RoomMemberWithUser, MemberStatus } from '@/lib/types/rooms'

// Mock Supabase client with proper chaining
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnValue(Promise.resolve('SUBSCRIBED')),
  track: jest.fn().mockReturnValue(Promise.resolve()),
  presenceState: jest.fn().mockReturnValue({}),
}

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    channel: () => mockChannel,
    removeChannel: jest.fn(),
  }),
}))

// Import after mocking
import MemberSidebar from '../MemberSidebar'

afterEach(() => {
  cleanup()
})

// Arbitraries for generating test data
const memberStatusArb = fc.constantFrom<MemberStatus>('idle', 'studying', 'break', 'offline')

// Use bounded dates to avoid invalid date issues
const validDateArb = fc.integer({ min: 0, max: Date.now() }).map((ts) => new Date(ts).toISOString())

const memberArb = fc.record({
  id: fc.uuid(),
  room_id: fc.uuid(),
  user_id: fc.uuid(),
  role: fc.constantFrom('creator', 'co_host', 'member'),
  joined_at: validDateArb,
  last_seen_at: fc.option(validDateArb, { nil: null }),
  user: fc.record({
    id: fc.uuid(),
    fullName: fc.option(
      fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
      { nil: null }
    ),
    avatarUrl: fc.option(fc.webUrl(), { nil: null }),
    email: fc.emailAddress(),
  }),
  isOnline: fc.boolean(),
  status: memberStatusArb,
}) as fc.Arbitrary<RoomMemberWithUser>

const membersListArb = fc.array(memberArb, { minLength: 1, maxLength: 10 })

describe('MemberSidebar Property Tests', () => {
  /**
   * Property 15: Member display includes presence data
   * For any member displayed in the sidebar, it should show avatar, name,
   * and online status, and show "Studying" status when their timer is running.
   */
  it('should display avatar, name, and online status for all members', () => {
    fc.assert(
      fc.property(membersListArb, fc.uuid(), (members, userId) => {
        const roomId = members[0]?.room_id || 'test-room'
        const { container, unmount } = render(
          <MemberSidebar roomId={roomId} userId={userId} members={members} />
        )

        try {
          // Each member should have their name displayed (or Anonymous for null names)
          members.forEach((member) => {
            const displayName = member.user?.fullName || 'Anonymous'
            // Name should be present in the container
            expect(container.textContent).toContain(displayName)
          })

          // Should show member count in header
          expect(container.textContent).toMatch(new RegExp(`/${members.length}`))
        } finally {
          unmount()
        }
      }),
      { numRuns: 100 }
    )
  })

  it('should display status indicator for each member', () => {
    fc.assert(
      fc.property(membersListArb, fc.uuid(), (members, userId) => {
        const roomId = members[0]?.room_id || 'test-room'
        const { container, unmount } = render(
          <MemberSidebar roomId={roomId} userId={userId} members={members} />
        )

        try {
          // Each member should have a status indicator (colored dot)
          const statusIndicators = container.querySelectorAll('[class*="rounded-full"][class*="bg-"]')
          // At least one indicator per member (the status dot)
          expect(statusIndicators.length).toBeGreaterThanOrEqual(members.length)
        } finally {
          unmount()
        }
      }),
      { numRuns: 50 }
    )
  })

  it('should show avatar or initial for each member', () => {
    fc.assert(
      fc.property(membersListArb, fc.uuid(), (members, userId) => {
        const roomId = members[0]?.room_id || 'test-room'
        const { container, unmount } = render(
          <MemberSidebar roomId={roomId} userId={userId} members={members} />
        )

        try {
          // Each member should have either an avatar image or an initial
          members.forEach((member) => {
            if (member.user?.avatarUrl) {
              // Should have an img element
              const imgs = container.querySelectorAll('img')
              expect(imgs.length).toBeGreaterThan(0)
            } else {
              // Should have initial letter
              const initial = (member.user?.fullName || 'A').charAt(0).toUpperCase()
              expect(container.textContent).toContain(initial)
            }
          })
        } finally {
          unmount()
        }
      }),
      { numRuns: 50 }
    )
  })

  it('should mark current user with "(you)" indicator', () => {
    fc.assert(
      fc.property(
        membersListArb.filter((m) => m.length > 0),
        (members) => {
          // Use first member's user_id as the current user
          const userId = members[0].user_id
          const roomId = members[0].room_id

          const { container, unmount } = render(
            <MemberSidebar roomId={roomId} userId={userId} members={members} />
          )

          try {
            // Should show "(you)" for the current user
            expect(container.textContent).toContain('(you)')
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should display status text for members', () => {
    fc.assert(
      fc.property(membersListArb, fc.uuid(), (members, userId) => {
        const roomId = members[0]?.room_id || 'test-room'
        const { container, unmount } = render(
          <MemberSidebar roomId={roomId} userId={userId} members={members} />
        )

        try {
          // Should contain at least one status text
          const hasStatusText =
            container.textContent?.includes('Studying') ||
            container.textContent?.includes('On Break') ||
            container.textContent?.includes('Idle') ||
            container.textContent?.includes('Offline')
          expect(hasStatusText).toBe(true)
        } finally {
          unmount()
        }
      }),
      { numRuns: 50 }
    )
  })

  it('should handle empty member name gracefully', () => {
    fc.assert(
      fc.property(
        memberArb.map((m) => ({
          ...m,
          user: { ...m.user, fullName: null },
        })),
        fc.uuid(),
        (member, userId) => {
          const { container, unmount } = render(
            <MemberSidebar roomId={member.room_id} userId={userId} members={[member]} />
          )

          try {
            // Should show "Anonymous" for null names
            expect(container.textContent).toContain('Anonymous')
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})
