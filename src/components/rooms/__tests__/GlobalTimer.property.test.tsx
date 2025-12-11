/**
 * Property-Based Tests for GlobalTimer Component
 * 
 * **Feature: study-rooms, Property 5: Creator sees timer controls, non-creators see read-only**
 * **Validates: Requirements 4.1, 4.5**
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as fc from 'fast-check'
import GlobalTimer from '../GlobalTimer'
import { TimerState } from '@/lib/types/rooms'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
    removeChannel: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('GlobalTimer Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Property 5: Creator sees timer controls, non-creators see read-only
   * For any room view, if the user is the creator they should see global timer controls,
   * otherwise they should see the timer in read-only mode.
   */
  test('Property 5: Creator sees timer controls, non-creators see read-only', () => {
    fc.assert(
      fc.property(
        // Generate random room ID
        fc.uuid(),
        // Generate random timer state
        fc.record({
          isRunning: fc.boolean(),
          isBreak: fc.boolean(),
          remainingSeconds: fc.integer({ min: 0, max: 7200 }),
          startedAt: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
          pausedAt: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
        }),
        // Generate random work/break minutes
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 1, max: 30 }),
        // Generate isCreator boolean
        fc.boolean(),
        (roomId, timerState, workMinutes, breakMinutes, isCreator) => {
          const { container, unmount } = render(
            <GlobalTimer
              roomId={roomId}
              isCreator={isCreator}
              initialState={timerState as TimerState}
              workMinutes={workMinutes}
              breakMinutes={breakMinutes}
            />
          )

          if (isCreator) {
            // Creator should see control buttons
            if (timerState.isRunning) {
              // Should see Pause button when running
              const pauseButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('Pause'))
              expect(pauseButton).toBeTruthy()
            } else {
              // Should see Start button when not running
              const startButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))
              expect(startButton).toBeTruthy()
            }

            // Should always see Reset button
            const resetButton = container.querySelector('button[title="Reset"]')
            expect(resetButton).toBeInTheDocument()

            // Should see edit duration button
            const editButton = container.querySelector('button[title="Edit Duration"]')
            expect(editButton).toBeInTheDocument()
          } else {
            // Non-creator should NOT see control buttons
            const startButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))
            const pauseButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('Pause'))
            const resetButton = container.querySelector('button[title="Reset"]')
            const editButton = container.querySelector('button[title="Edit Duration"]')

            expect(startButton).toBeFalsy()
            expect(pauseButton).toBeFalsy()
            expect(resetButton).not.toBeInTheDocument()
            expect(editButton).not.toBeInTheDocument()

            // Should see read-only message
            const readOnlyText = timerState.isRunning ? 'Timer is running' : 'Waiting for creator to start'
            const readOnlyMessage = Array.from(container.querySelectorAll('div')).find(div => 
              div.textContent === readOnlyText
            )
            expect(readOnlyMessage).toBeTruthy()
          }

          // Both should see the timer display
          const timerDisplay = container.querySelector('.font-mono')
          expect(timerDisplay).toBeInTheDocument()

          // Both should see the phase indicator (Study Time or Break Time)
          const phaseText = timerState.isBreak ? 'Break Time' : 'Study Time'
          const phaseIndicator = Array.from(container.querySelectorAll('div')).find(div =>
            div.textContent?.includes(phaseText)
          )
          expect(phaseIndicator).toBeTruthy()

          // Clean up
          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Timer display format is consistent
   * For any remaining seconds value, the timer should display in MM:SS format
   */
  test('Timer display format is consistent for all values', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 0, max: 5999 }), // Max 99:59 to keep 2-digit minutes
        fc.boolean(),
        fc.integer({ min: 1, max: 99 }), // Max 99 minutes
        fc.integer({ min: 1, max: 30 }),
        (roomId, remainingSeconds, isCreator, workMinutes, breakMinutes) => {
          const timerState: TimerState = {
            isRunning: false,
            isBreak: false,
            remainingSeconds,
          }

          const { container, unmount } = render(
            <GlobalTimer
              roomId={roomId}
              isCreator={isCreator}
              initialState={timerState}
              workMinutes={workMinutes}
              breakMinutes={breakMinutes}
            />
          )

          const timerDisplay = container.querySelector('.font-mono')
          expect(timerDisplay).toBeInTheDocument()

          // Check format is MM:SS
          const displayText = timerDisplay?.textContent || ''
          const formatRegex = /^\d{2}:\d{2}$/
          expect(displayText).toMatch(formatRegex)

          // Verify the displayed time matches the input
          const [mins, secs] = displayText.split(':').map(Number)
          const displayedSeconds = mins * 60 + secs
          expect(displayedSeconds).toBe(remainingSeconds)

          // Clean up
          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })
})
