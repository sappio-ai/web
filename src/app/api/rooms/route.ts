import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RoomService } from '@/lib/services/RoomService'

/**
 * GET /api/rooms
 * Returns all rooms for the authenticated user (created or joined)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    const rooms = await RoomService.getUserRooms(userData.id)

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Rooms list error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rooms
 * Creates a new room
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    const body = await request.json()
    const { name, backgroundTheme, privacy, pomodoroWorkMinutes, pomodoroBreakMinutes } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room name is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const room = await RoomService.createRoom(userData.id, {
      name: name.trim(),
      backgroundTheme: backgroundTheme || 'forest',
      privacy: privacy || 'private',
      pomodoroWorkMinutes: pomodoroWorkMinutes || 25,
      pomodoroBreakMinutes: pomodoroBreakMinutes || 5,
    })

    return NextResponse.json({ room }, { status: 201 })
  } catch (error) {
    console.error('Room creation error:', error)
    
    // Handle validation errors from service
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
