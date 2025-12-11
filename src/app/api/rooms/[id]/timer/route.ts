import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TimerService } from '@/lib/services/TimerService'

/**
 * GET /api/rooms/:id/timer
 * Returns the global timer state for a room
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: roomId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Get user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Verify user is a member
    const { data: membership } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userData.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 })
    }

    const timerState = await TimerService.getGlobalTimerState(roomId, userData.id)

    return NextResponse.json({ timerState })
  } catch (error) {
    console.error('Timer state retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rooms/:id/timer
 * Updates the global timer state (creator only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: roomId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Get user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Verify user is the creator
    const { data: room } = await supabase
      .from('study_rooms')
      .select('creator_id')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ error: 'Room not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (room.creator_id !== userData.id) {
      return NextResponse.json(
        { error: 'Only the room creator can control the global timer', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, isBreak } = body

    let timerState

    // Handle action-based requests
    if (action) {
      switch (action) {
        case 'start':
          timerState = await TimerService.startGlobalTimer(roomId, userData.id, isBreak || false)
          break
        case 'pause':
          timerState = await TimerService.pauseGlobalTimer(roomId, userData.id)
          break
        case 'reset':
          timerState = await TimerService.resetGlobalTimer(roomId, userData.id)
          break
        case 'complete':
          timerState = await TimerService.completeTimerPhase(roomId, userData.id)
          break
        default:
          return NextResponse.json(
            { error: 'Invalid action', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
      }
    } else {
      // Handle direct state update
      const { isRunning, remainingSeconds, startedAt } = body

      // Validate timer state
      if (typeof isRunning !== 'boolean') {
        return NextResponse.json(
          { error: 'isRunning must be a boolean', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }

      if (typeof isBreak !== 'boolean') {
        return NextResponse.json(
          { error: 'isBreak must be a boolean', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }

      if (typeof remainingSeconds !== 'number' || remainingSeconds < 0) {
        return NextResponse.json(
          { error: 'remainingSeconds must be a non-negative number', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }

      timerState = await TimerService.updateGlobalTimer(roomId, userData.id, {
        isRunning,
        isBreak,
        remainingSeconds,
        startedAt: startedAt || undefined,
      })
    }

    return NextResponse.json({ success: true, timerState })
  } catch (error) {
    console.error('Timer update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
