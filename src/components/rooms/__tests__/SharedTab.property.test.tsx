/**
 * Property-based tests for SharedTab component
 * Feature: study-rooms, Property 4, 13, 14: Shared tab displays all shared tools with completion statistics and filtering
 * Validates: Requirements 3.4, 9.1, 9.2, 9.4
 */

import { render, cleanup, screen, fireEvent, waitFor } from '@testing-library/react'
import fc from 'fast-check'
import SharedTab from '../SharedTab'
import { SharedTool, ToolType } from '@/lib/types/rooms'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

afterEach(() => {
  cleanup()
  mockFetch.mockClear()
})

// Arbitraries for generating test data
const toolTypeArb = fc.constantFrom<ToolType>('quiz', 'flashcards', 'notes')

const validDateArb = fc.integer({ min: Date.now() - 86400000 * 30, max: Date.now() }).map((ts) => new Date(ts).toISOString())

const sharedToolArb = fc.record({
  id: fc.uuid(),
  roomId: fc.uuid(),
  messageId: fc.uuid(),
  sharerId: fc.uuid(),
  sharer: fc.option(
    fc.record({
      fullName: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0), { nil: null }),
      avatarUrl: fc.option(fc.webUrl(), { nil: null }),
    }),
    { nil: undefined }
  ),
  toolType: toolTypeArb,
  toolId: fc.uuid(),
  toolName: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  studyPackId: fc.option(fc.uuid(), { nil: null }),
  studyPack: fc.option(
    fc.record({
      title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    }),
    { nil: undefined }
  ),
  completionCount: fc.integer({ min: 0, max: 50 }),
  sharedAt: validDateArb,
  totalMembers: fc.integer({ min: 1, max: 50 }),
}) as fc.Arbitrary<SharedTool>

const sharedToolsListArb = fc.array(sharedToolArb, { minLength: 0, maxLength: 10 })

describe('SharedTab Property Tests', () => {
  /**
   * Property 4: Shared tab displays all shared tools
   * For any room with shared tools, the Shared tab should display all tools that have been shared in that room.
   */
  it('should display all shared tools when open', async () => {
    await fc.assert(
      fc.asyncProperty(sharedToolsListArb, fc.uuid(), fc.uuid(), async (tools, roomId, userId) => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sharedTools: tools }),
        })

        const { container, unmount } = render(
          <SharedTab roomId={roomId} userId={userId} isOpen={true} onToolOpen={jest.fn()} />
        )

        try {
          // Wait for loading to complete
          await waitFor(() => {
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
          }, { timeout: 1000 })

          if (tools.length === 0) {
            // Should show empty state
            expect(container.textContent).toContain('No shared tools yet')
          } else {
            // Each tool name should be displayed
            tools.forEach((tool) => {
              expect(container.textContent).toContain(tool.toolName)
            })
          }
        } finally {
          unmount()
        }
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property 13: Shared tools display completion statistics
   * For any shared tool in the Shared tab, it should display the tool name, type, sharer name, and completion count.
   */
  it('should display completion statistics for each tool', async () => {
    await fc.assert(
      fc.asyncProperty(
        sharedToolsListArb.filter((tools) => tools.length > 0),
        fc.uuid(),
        fc.uuid(),
        async (tools, roomId, userId) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sharedTools: tools }),
          })

          const { container, unmount } = render(
            <SharedTab roomId={roomId} userId={userId} isOpen={true} onToolOpen={jest.fn()} />
          )

          try {
            await waitFor(() => {
              expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
            }, { timeout: 1000 })

            // Each tool should show completion count
            tools.forEach((tool) => {
              // Completion count format: "X/Y completed"
              const completionRegex = new RegExp(`${tool.completionCount}/`)
              expect(container.textContent).toMatch(completionRegex)
            })
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 14: Shared tool filter returns matching types only
   * For any filter applied to shared tools, the results should only contain tools of the selected type.
   */
  it('should filter tools by type when filter is applied', async () => {
    // Create tools with mixed types
    const mixedTools: SharedTool[] = [
      {
        id: '1',
        roomId: 'room1',
        messageId: 'msg1',
        sharerId: 'user1',
        toolType: 'quiz',
        toolId: 'tool1',
        toolName: 'Quiz Tool',
        studyPackId: 'pack1',
        completionCount: 2,
        sharedAt: new Date().toISOString(),
        totalMembers: 5,
      },
      {
        id: '2',
        roomId: 'room1',
        messageId: 'msg2',
        sharerId: 'user1',
        toolType: 'flashcards',
        toolId: 'tool2',
        toolName: 'Flashcard Tool',
        studyPackId: 'pack1',
        completionCount: 3,
        sharedAt: new Date().toISOString(),
        totalMembers: 5,
      },
      {
        id: '3',
        roomId: 'room1',
        messageId: 'msg3',
        sharerId: 'user1',
        toolType: 'notes',
        toolId: 'tool3',
        toolName: 'Notes Tool',
        studyPackId: 'pack1',
        completionCount: 1,
        sharedAt: new Date().toISOString(),
        totalMembers: 5,
      },
    ]

    // Test filtering for quizzes only
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sharedTools: mixedTools }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sharedTools: mixedTools.filter((t) => t.toolType === 'quiz') }),
      })

    const { container, unmount } = render(
      <SharedTab roomId="room1" userId="user1" isOpen={true} onToolOpen={jest.fn()} />
    )

    try {
      // Wait for initial load
      await waitFor(() => {
        expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
      }, { timeout: 1000 })

      // Initially all tools should be shown
      expect(container.textContent).toContain('Quiz Tool')
      expect(container.textContent).toContain('Flashcard Tool')
      expect(container.textContent).toContain('Notes Tool')

      // Click on Quizzes filter
      const quizzesButton = screen.getByText('Quizzes')
      fireEvent.click(quizzesButton)

      // Wait for filtered results
      await waitFor(() => {
        // After filtering, only quiz should be shown
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('type=quiz'))
      }, { timeout: 1000 })
    } finally {
      unmount()
    }
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <SharedTab roomId="room1" userId="user1" isOpen={false} onToolOpen={jest.fn()} />
    )

    // Should return null when not open
    expect(container.firstChild).toBeNull()
  })

  it('should call onToolOpen when action button is clicked', async () => {
    const tool: SharedTool = {
      id: '1',
      roomId: 'room1',
      messageId: 'msg1',
      sharerId: 'user1',
      toolType: 'quiz',
      toolId: 'tool1',
      toolName: 'Test Quiz',
      studyPackId: 'pack1',
      completionCount: 0,
      sharedAt: new Date().toISOString(),
      totalMembers: 5,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sharedTools: [tool] }),
    })

    const onToolOpen = jest.fn()
    const { container, unmount } = render(
      <SharedTab roomId="room1" userId="user1" isOpen={true} onToolOpen={onToolOpen} />
    )

    try {
      await waitFor(() => {
        expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
      }, { timeout: 1000 })

      // Click the action button
      const actionButton = screen.getByText('Take Quiz')
      fireEvent.click(actionButton)

      expect(onToolOpen).toHaveBeenCalledWith(tool)
    } finally {
      unmount()
    }
  })
})
