/**
 * Property-Based Tests for ToolModal Component
 * 
 * **Feature: study-rooms, Property 10: Tool modal renders correct component**
 * Validates: Requirements 8.2
 * 
 * For any shared tool opened in a modal, the modal should render the appropriate 
 * component (FlashcardsViewer for flashcards, QuizViewer for quizzes, NotesViewer for notes).
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import fc from 'fast-check'
import ToolModal from '../ToolModal'
import { SharedTool } from '@/lib/types/rooms'

// Mock the viewer components
jest.mock('../FlashcardsViewer', () => {
  return function MockFlashcardsViewer() {
    return <div data-testid="flashcards-viewer">Flashcards Viewer</div>
  }
})

jest.mock('../QuizViewer', () => {
  return function MockQuizViewer() {
    return <div data-testid="quiz-viewer">Quiz Viewer</div>
  }
})

jest.mock('../NotesViewer', () => {
  return function MockNotesViewer() {
    return <div data-testid="notes-viewer">Notes Viewer</div>
  }
})

// Arbitraries for generating test data
const toolTypeArbitrary = fc.constantFrom('quiz', 'flashcards', 'notes')

const sharedToolArbitrary = (toolType: 'quiz' | 'flashcards' | 'notes') =>
  fc.record({
    id: fc.uuid(),
    roomId: fc.uuid(),
    messageId: fc.uuid(),
    sharerId: fc.uuid(),
    sharer: fc.record({
      fullName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      avatarUrl: fc.option(fc.webUrl(), { nil: null }),
    }),
    toolType: fc.constant(toolType),
    toolId: fc.uuid(),
    toolName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    studyPackId: fc.option(fc.uuid(), { nil: null }),
    sharedAt: fc.integer({ min: 1577836800000, max: 1924905600000 }).map((timestamp) => new Date(timestamp).toISOString()),
    completionCount: fc.nat({ max: 100 }),
    totalMembers: fc.nat({ max: 100 }),
  })

describe('ToolModal Property Tests', () => {
  const mockOnClose = jest.fn()
  const mockOnComplete = jest.fn()
  const mockUserId = 'test-user-id'
  const mockRoomId = 'test-room-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Property 10: Tool modal renders correct component
   * 
   * For any shared tool with a specific tool type, when the modal is opened,
   * it should render the corresponding viewer component.
   */
  it('should render FlashcardsViewer for flashcards tool type', () => {
    fc.assert(
      fc.property(sharedToolArbitrary('flashcards'), (tool) => {
        const { unmount } = render(
          <ToolModal
            isOpen={true}
            tool={tool as SharedTool}
            roomId={mockRoomId}
            userId={mockUserId}
            onClose={mockOnClose}
            onComplete={mockOnComplete}
          />
        )

        // Should render FlashcardsViewer
        const flashcardsViewer = screen.getByTestId('flashcards-viewer')
        expect(flashcardsViewer).toBeInTheDocument()

        // Should NOT render other viewers
        expect(screen.queryByTestId('quiz-viewer')).not.toBeInTheDocument()
        expect(screen.queryByTestId('notes-viewer')).not.toBeInTheDocument()

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  it('should render QuizViewer for quiz tool type', () => {
    fc.assert(
      fc.property(sharedToolArbitrary('quiz'), (tool) => {
        const { unmount } = render(
          <ToolModal
            isOpen={true}
            tool={tool as SharedTool}
            roomId={mockRoomId}
            userId={mockUserId}
            onClose={mockOnClose}
            onComplete={mockOnComplete}
          />
        )

        // Should render QuizViewer
        const quizViewer = screen.getByTestId('quiz-viewer')
        expect(quizViewer).toBeInTheDocument()

        // Should NOT render other viewers
        expect(screen.queryByTestId('flashcards-viewer')).not.toBeInTheDocument()
        expect(screen.queryByTestId('notes-viewer')).not.toBeInTheDocument()

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  it('should render NotesViewer for notes tool type', () => {
    fc.assert(
      fc.property(sharedToolArbitrary('notes'), (tool) => {
        const { unmount } = render(
          <ToolModal
            isOpen={true}
            tool={tool as SharedTool}
            roomId={mockRoomId}
            userId={mockUserId}
            onClose={mockOnClose}
            onComplete={mockOnComplete}
          />
        )

        // Should render NotesViewer
        const notesViewer = screen.getByTestId('notes-viewer')
        expect(notesViewer).toBeInTheDocument()

        // Should NOT render other viewers
        expect(screen.queryByTestId('flashcards-viewer')).not.toBeInTheDocument()
        expect(screen.queryByTestId('quiz-viewer')).not.toBeInTheDocument()

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Modal should display tool metadata correctly
   * 
   * For any shared tool, the modal header should display the tool name
   * and sharer information.
   */
  it('should display tool name and sharer information for any tool type', () => {
    fc.assert(
      fc.property(
        toolTypeArbitrary,
        fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length > 1),
        fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
        (toolType, toolName, sharerName) => {
          const tool: SharedTool = {
            id: 'test-id',
            roomId: mockRoomId,
            sharedBy: 'sharer-id',
            sharedByUser: {
              fullName: sharerName,
              avatarUrl: null,
            },
            toolType: toolType as 'quiz' | 'flashcards' | 'notes',
            studyPackId: 'pack-id',
            quizId: toolType === 'quiz' ? 'quiz-id' : undefined,
            toolName: toolName,
            createdAt: new Date().toISOString(),
            completionCount: 0,
            totalMembers: 1,
          }

          const { container, unmount } = render(
            <ToolModal
              isOpen={true}
              tool={tool}
              roomId={mockRoomId}
              userId={mockUserId}
              onClose={mockOnClose}
              onComplete={mockOnComplete}
            />
          )

          // Should display tool name (use flexible text matcher)
          const toolNameElements = screen.getAllByText((content, element) => {
            return element?.textContent === toolName
          })
          expect(toolNameElements.length).toBeGreaterThan(0)

          // Should display sharer name (use flexible text matcher)
          const sharerText = `Shared by ${sharerName}`
          const sharerElements = screen.getAllByText((content, element) => {
            return element?.textContent === sharerText
          })
          expect(sharerElements.length).toBeGreaterThan(0)

          unmount()
          // Clean up any remaining DOM elements
          document.body.innerHTML = ''
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Modal should not render when closed
   * 
   * For any tool, when isOpen is false, the modal should not render any content.
   */
  it('should not render any content when isOpen is false', () => {
    fc.assert(
      fc.property(toolTypeArbitrary, (toolType) => {
        const tool: SharedTool = {
          id: 'test-id',
          roomId: mockRoomId,
          sharedBy: 'sharer-id',
          sharedByUser: {
            fullName: 'Test User',
            avatarUrl: null,
          },
          toolType: toolType as 'quiz' | 'flashcards' | 'notes',
          studyPackId: 'pack-id',
          quizId: toolType === 'quiz' ? 'quiz-id' : undefined,
          toolName: 'Test Tool',
          createdAt: new Date().toISOString(),
          completionCount: 0,
          totalMembers: 1,
        }

        const { container, unmount } = render(
          <ToolModal
            isOpen={false}
            tool={tool}
            roomId={mockRoomId}
            userId={mockUserId}
            onClose={mockOnClose}
            onComplete={mockOnComplete}
          />
        )

        // Should not render any modal content
        expect(container.firstChild).toBeNull()

        unmount()
      }),
      { numRuns: 100 }
    )
  })
})
