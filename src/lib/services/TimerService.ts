/**
 * TimerService - Handles global timer state management for study rooms
 * Implements Pomodoro timer with work/break cycles synchronized across members
 */

import { createClient } from '@/lib/supabase/server'
import type { TimerState } from '@/lib/types/rooms'

export class TimerService {
  /**
   * Gets the current global timer state for a room
   */
  static async getGlobalTimerState(
    roomId: string,
    userId: string
  ): Promise<TimerState> {
    const supabase = await createClient()

    // Verify user is a member of the room
    const { data: member } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    if (!member) {
      throw new Error('User is not a member of this room')
    }

    // Get room with timer state from meta_json
    const { data: room, error } = await supabase
      .from('study_rooms')
      .select('meta_json, pomodoro_work_minutes, pomodoro_break_minutes')
      .eq('id', roomId)
      .single()

    if (error || !room) {
      throw new Error('Room not found')
    }

    // Extract timer state from meta_json or return default
    const metaJson = room.meta_json as any
    const timerState = metaJson?.timer_state

    if (timerState) {
      return {
        isRunning: timerState.is_running || false,
        isBreak: timerState.is_break || false,
        remainingSeconds: timerState.remaining_seconds || 0,
        startedAt: timerState.started_at,
        pausedAt: timerState.paused_at,
      }
    }

    // Return default state
    return {
      isRunning: false,
      isBreak: false,
      remainingSeconds: room.pomodoro_work_minutes * 60,
    }
  }

  /**
   * Updates the global timer state (creator only)
   */
  static async updateGlobalTimer(
    roomId: string,
    userId: string,
    timerState: Partial<TimerState>
  ): Promise<TimerState> {
    const supabase = await createClient()

    // Verify user is the creator
    const { data: room } = await supabase
      .from('study_rooms')
      .select('creator_id, meta_json, pomodoro_work_minutes, pomodoro_break_minutes')
      .eq('id', roomId)
      .single()

    if (!room || room.creator_id !== userId) {
      throw new Error('Only the room creator can control the global timer')
    }

    // Get current timer state
    const metaJson = (room.meta_json as any) || {}
    const currentTimerState = metaJson.timer_state || {}

    // Merge with new state
    const newTimerState = {
      is_running: timerState.isRunning ?? currentTimerState.is_running ?? false,
      is_break: timerState.isBreak ?? currentTimerState.is_break ?? false,
      remaining_seconds:
        timerState.remainingSeconds ?? currentTimerState.remaining_seconds ?? room.pomodoro_work_minutes * 60,
      started_at: timerState.startedAt ?? currentTimerState.started_at,
      paused_at: timerState.pausedAt ?? currentTimerState.paused_at,
    }

    // Update room meta_json
    const updatedMetaJson = {
      ...metaJson,
      timer_state: newTimerState,
    }

    const { error: updateError } = await supabase
      .from('study_rooms')
      .update({
        meta_json: updatedMetaJson,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)

    if (updateError) {
      throw new Error(`Failed to update timer state: ${updateError.message}`)
    }

    return {
      isRunning: newTimerState.is_running,
      isBreak: newTimerState.is_break,
      remainingSeconds: newTimerState.remaining_seconds,
      startedAt: newTimerState.started_at,
      pausedAt: newTimerState.paused_at,
    }
  }

  /**
   * Starts the global timer
   */
  static async startGlobalTimer(
    roomId: string,
    userId: string,
    isBreak: boolean = false
  ): Promise<TimerState> {
    const supabase = await createClient()

    // Get room settings and current state
    const { data: room } = await supabase
      .from('study_rooms')
      .select('pomodoro_work_minutes, pomodoro_break_minutes, meta_json')
      .eq('id', roomId)
      .single()

    if (!room) {
      throw new Error('Room not found')
    }

    const metaJson = (room.meta_json as any) || {}
    const currentTimerState = metaJson.timer_state || {}

    // Determine remaining seconds:
    // - If resuming from pause (same mode), use current remaining seconds
    // - If starting fresh or switching modes, use full duration
    let remainingSeconds: number
    const currentIsBreak = currentTimerState.is_break || false
    const isSameMode = currentIsBreak === isBreak
    
    if (isSameMode && currentTimerState.paused_at && currentTimerState.remaining_seconds > 0) {
      // Resuming from pause - use existing remaining seconds
      remainingSeconds = currentTimerState.remaining_seconds
      console.log('[TimerService.startGlobalTimer] Resuming from pause:', {
        remainingSeconds,
        isBreak
      })
    } else {
      // Starting fresh or switching modes - use full duration
      remainingSeconds = isBreak
        ? room.pomodoro_break_minutes * 60
        : room.pomodoro_work_minutes * 60
      console.log('[TimerService.startGlobalTimer] Starting fresh:', {
        remainingSeconds,
        isBreak,
        reason: isSameMode ? 'no pause state' : 'mode switch'
      })
    }

    return this.updateGlobalTimer(roomId, userId, {
      isRunning: true,
      isBreak,
      remainingSeconds,
      startedAt: new Date().toISOString(),
      pausedAt: undefined,
    })
  }

  /**
   * Pauses the global timer
   */
  static async pauseGlobalTimer(
    roomId: string,
    userId: string
  ): Promise<TimerState> {
    const supabase = await createClient()
    
    // Get the current state from database
    const { data: room } = await supabase
      .from('study_rooms')
      .select('meta_json, pomodoro_work_minutes, pomodoro_break_minutes')
      .eq('id', roomId)
      .single()

    if (!room) {
      throw new Error('Room not found')
    }

    const metaJson = (room.meta_json as any) || {}
    const timerState = metaJson.timer_state || {}

    console.log('[TimerService.pauseGlobalTimer] Current DB state:', {
      is_running: timerState.is_running,
      started_at: timerState.started_at,
      remaining_seconds: timerState.remaining_seconds,
      is_break: timerState.is_break
    })

    // Calculate actual remaining seconds based on elapsed time
    let remainingSeconds = timerState.remaining_seconds || room.pomodoro_work_minutes * 60
    
    if (timerState.is_running && timerState.started_at) {
      const startTime = new Date(timerState.started_at).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      remainingSeconds = Math.max(0, timerState.remaining_seconds - elapsed)
      
      console.log('[TimerService.pauseGlobalTimer] Calculating remaining seconds:', {
        startTime: new Date(timerState.started_at).toISOString(),
        now: new Date(now).toISOString(),
        elapsed,
        originalRemaining: timerState.remaining_seconds,
        calculatedRemaining: remainingSeconds
      })
    } else {
      console.log('[TimerService.pauseGlobalTimer] Timer not running, using stored remaining:', remainingSeconds)
    }

    return this.updateGlobalTimer(roomId, userId, {
      isRunning: false,
      pausedAt: new Date().toISOString(),
      remainingSeconds,
    })
  }

  /**
   * Resets the global timer
   */
  static async resetGlobalTimer(
    roomId: string,
    userId: string
  ): Promise<TimerState> {
    const supabase = await createClient()

    const { data: room } = await supabase
      .from('study_rooms')
      .select('pomodoro_work_minutes')
      .eq('id', roomId)
      .single()

    if (!room) {
      throw new Error('Room not found')
    }

    return this.updateGlobalTimer(roomId, userId, {
      isRunning: false,
      isBreak: false,
      remainingSeconds: room.pomodoro_work_minutes * 60,
      startedAt: undefined,
      pausedAt: undefined,
    })
  }

  /**
   * Handles timer completion and transitions to next phase
   */
  static async completeTimerPhase(
    roomId: string,
    userId: string
  ): Promise<TimerState> {
    const currentState = await this.getGlobalTimerState(roomId, userId)

    // Transition: work -> break or break -> work
    const nextIsBreak = !currentState.isBreak
    console.log('[TimerService.completeTimerPhase] Transitioning:', {
      currentIsBreak: currentState.isBreak,
      nextIsBreak
    })

    return this.startGlobalTimer(roomId, userId, nextIsBreak)
  }

  /**
   * Returns subscription configuration for real-time timer updates
   * This method signature is for documentation - actual implementation
   * will be in client components using Supabase Realtime
   */
  static getSubscriptionConfig(roomId: string) {
    return {
      channel: `room:${roomId}:timer`,
      table: 'study_rooms',
      filter: `id=eq.${roomId}`,
      event: 'UPDATE',
    }
  }
}
