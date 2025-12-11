/**
 * Property-Based Tests for PersonalTimer Component
 * 
 * **Feature: study-rooms, Property 7: Personal timer isolation**
 * **Validates: Requirements 5.2, 5.3, 5.4**
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as fc from 'fast-check'
import PersonalTimer from '../PersonalTimer'

// Mock Notification API
const mockNotification = jest.fn()
global.Notification = mockNotification as any
Object.defineProperty(global.Notification, 'permission', {
  writable: true,
  value: 'granted',
})

describe('PersonalTimer Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  /**
   * Property 7: Personal timer isolation
   * For any user's personal timer action (start, pause, edit), only that user's timer state
   * should be affected, not other users' timers.
   * 
   * We test this by rendering multiple PersonalTimer instances and verifying that
   * actions on one timer don't affect the others.
   */
  test('Property 7: Personal timer isolation - multiple timers operate independently', () => {
    fc.assert(
      fc.property(
        // Generate random initial durations for 3 different users
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 1, max: 30 }),
        (work1, work2, work3, break1, break2, break3) => {
          const statusCallbacks = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
          ]

          // Render three independent personal timers
          const { container, unmount } = render(
            <div>
              <div data-testid="timer-1">
                <PersonalTimer
                  onStatusChange={statusCallbacks[0]}
                  defaultWorkMinutes={work1}
                  defaultBreakMinutes={break1}
                />
              </div>
              <div data-testid="timer-2">
                <PersonalTimer
                  onStatusChange={statusCallbacks[1]}
                  defaultWorkMinutes={work2}
                  defaultBreakMinutes={break2}
                />
              </div>
              <div data-testid="timer-3">
                <PersonalTimer
                  onStatusChange={statusCallbacks[2]}
                  defaultWorkMinutes={work3}
                  defaultBreakMinutes={break3}
                />
              </div>
            </div>
          )

          // Get timer containers
          const timer1 = container.querySelector('[data-testid="timer-1"]')!
          const timer2 = container.querySelector('[data-testid="timer-2"]')!
          const timer3 = container.querySelector('[data-testid="timer-3"]')!

          // Get start buttons for each timer
          const timer1StartBtn = Array.from(timer1.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))
          const timer2StartBtn = Array.from(timer2.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))
          const timer3StartBtn = Array.from(timer3.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))

          expect(timer1StartBtn).toBeTruthy()
          expect(timer2StartBtn).toBeTruthy()
          expect(timer3StartBtn).toBeTruthy()

          // Start only the first timer
          fireEvent.click(timer1StartBtn!)

          // Verify only the first timer's status changed
          expect(statusCallbacks[0]).toHaveBeenCalledWith('studying')
          expect(statusCallbacks[1]).not.toHaveBeenCalledWith('studying')
          expect(statusCallbacks[2]).not.toHaveBeenCalledWith('studying')

          // Verify only the first timer shows pause button
          const timer1PauseBtn = Array.from(timer1.querySelectorAll('button')).find(btn => btn.textContent?.includes('Pause'))
          const timer2StillStartBtn = Array.from(timer2.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))
          const timer3StillStartBtn = Array.from(timer3.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))

          expect(timer1PauseBtn).toBeTruthy()
          expect(timer2StillStartBtn).toBeTruthy()
          expect(timer3StillStartBtn).toBeTruthy()

          // Start the second timer
          fireEvent.click(timer2StillStartBtn!)

          // Verify second timer's status changed
          expect(statusCallbacks[1]).toHaveBeenCalledWith('studying')
          expect(statusCallbacks[2]).not.toHaveBeenCalledWith('studying')

          // Verify both timer 1 and 2 show pause buttons
          const timer1StillPauseBtn = Array.from(timer1.querySelectorAll('button')).find(btn => btn.textContent?.includes('Pause'))
          const timer2PauseBtn = Array.from(timer2.querySelectorAll('button')).find(btn => btn.textContent?.includes('Pause'))
          const timer3StillStartBtn2 = Array.from(timer3.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))

          expect(timer1StillPauseBtn).toBeTruthy()
          expect(timer2PauseBtn).toBeTruthy()
          expect(timer3StillStartBtn2).toBeTruthy()

          // Pause the first timer
          fireEvent.click(timer1StillPauseBtn!)

          // Verify first timer status changed to idle
          expect(statusCallbacks[0]).toHaveBeenCalledWith('idle')

          // Verify timer 1 now shows start, timer 2 still shows pause, timer 3 still shows start
          const timer1BackToStartBtn = Array.from(timer1.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))
          const timer2StillPauseBtn = Array.from(timer2.querySelectorAll('button')).find(btn => btn.textContent?.includes('Pause'))
          const timer3StillStartBtn3 = Array.from(timer3.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))

          expect(timer1BackToStartBtn).toBeTruthy()
          expect(timer2StillPauseBtn).toBeTruthy()
          expect(timer3StillStartBtn3).toBeTruthy()

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Timer controls are always present
   * For any timer, it should always have start/pause, reset, and edit buttons
   */
  test('Timer controls are always present', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 1, max: 30 }),
        (workMinutes, breakMinutes) => {
          const onStatusChange = jest.fn()

          const { container, unmount } = render(
            <PersonalTimer
              onStatusChange={onStatusChange}
              defaultWorkMinutes={workMinutes}
              defaultBreakMinutes={breakMinutes}
            />
          )

          // Should have start or pause button
          const startOrPauseButton = Array.from(container.querySelectorAll('button')).find(btn => 
            btn.textContent?.includes('Start') || btn.textContent?.includes('Pause')
          )
          expect(startOrPauseButton).toBeTruthy()

          // Should have reset button
          const resetButton = container.querySelector('button[title="Reset"]')
          expect(resetButton).toBeTruthy()

          // Should have edit button
          const editButton = container.querySelector('button[title="Edit Duration"]')
          expect(editButton).toBeTruthy()

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Status callback reflects timer state
   * For any timer state change, the status callback should be called with the correct status
   */
  test('Status callback reflects timer state correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 1, max: 30 }),
        (workMinutes, breakMinutes) => {
          const onStatusChange = jest.fn()

          const { container, unmount } = render(
            <PersonalTimer
              onStatusChange={onStatusChange}
              defaultWorkMinutes={workMinutes}
              defaultBreakMinutes={breakMinutes}
            />
          )

          // Initially should be idle
          expect(onStatusChange).toHaveBeenCalledWith('idle')

          // Start timer - should be studying
          const startButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('Start'))
          expect(startButton).toBeTruthy()
          fireEvent.click(startButton!)
          expect(onStatusChange).toHaveBeenCalledWith('studying')

          // Pause timer - should be idle
          const pauseButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('Pause'))
          expect(pauseButton).toBeTruthy()
          fireEvent.click(pauseButton!)
          expect(onStatusChange).toHaveBeenCalledWith('idle')

          // Reset timer - should be idle
          const resetButton = container.querySelector('button[title="Reset"]')
          expect(resetButton).toBeTruthy()
          fireEvent.click(resetButton!)
          expect(onStatusChange).toHaveBeenCalledWith('idle')

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Each timer maintains independent duration settings
   * For any two timers with different durations, they should display different times
   */
  test('Each timer maintains independent duration settings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 60 }),
        fc.integer({ min: 10, max: 60 }),
        (work1, work2) => {
          // Skip if durations are the same
          fc.pre(work1 !== work2)

          const callback1 = jest.fn()
          const callback2 = jest.fn()

          const { container, unmount } = render(
            <div>
              <div data-testid="timer-1">
                <PersonalTimer
                  onStatusChange={callback1}
                  defaultWorkMinutes={work1}
                  defaultBreakMinutes={5}
                />
              </div>
              <div data-testid="timer-2">
                <PersonalTimer
                  onStatusChange={callback2}
                  defaultWorkMinutes={work2}
                  defaultBreakMinutes={5}
                />
              </div>
            </div>
          )

          // Get timer displays
          const timer1 = container.querySelector('[data-testid="timer-1"]')
          const timer2 = container.querySelector('[data-testid="timer-2"]')

          const timer1Display = timer1?.querySelector('.font-mono')?.textContent
          const timer2Display = timer2?.querySelector('.font-mono')?.textContent

          // Verify timers show different times
          expect(timer1Display).not.toBe(timer2Display)

          // Verify each timer shows its configured duration
          const expectedTime1 = `${work1.toString().padStart(2, '0')}:00`
          const expectedTime2 = `${work2.toString().padStart(2, '0')}:00`
          expect(timer1Display).toBe(expectedTime1)
          expect(timer2Display).toBe(expectedTime2)

          unmount()
        }
      ),
      { numRuns: 50 }
    )
  })
})
