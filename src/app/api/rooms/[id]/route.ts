import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RoomService } from '@/lib/services/RoomService'

/**
 * GET /api/rooms/:id
 * Returns room details with member information
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

    const room = await RoomService.getRoom(roomId)

    if (!room) {
      return NextResponse.json({ error: 'Room not found', code: 'NOT_FOUND' }, { status: 404 })
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

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Room retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/rooms/:id
 * Updates room settings (creator only)
 */
export async function PATCH(
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
        { error: 'Only the room creator can update settings', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, backgroundTheme, privacy, pomodoroWorkMinutes, pomodoroBreakMinutes } = body

    const updatedRoom = await RoomService.updateRoom(roomId, userData.id, {
      name,
      backgroundTheme,
      privacy,
      pomodoroWorkMinutes,
      pomodoroBreakMinutes,
    })

    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    console.error('Room update error:', error)
    
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

/**
 * DELETE /api/rooms/:id
 * Deletes a room (creator only)
 */
export async function DELETE(
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
        { error: 'Only the room creator can delete the room', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    await RoomService.deleteRoom(roomId, userData.id)

    return NextResponse.json({ success: true, message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Room deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
