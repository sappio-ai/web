import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RoomService } from '@/lib/services/RoomService'

/**
 * GET /api/rooms/:id/members
 * Returns all members of a room
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

    // Get all members with user details
    const { data: members, error: membersError } = await supabase
      .from('room_members')
      .select(`
        id,
        room_id,
        user_id,
        role,
        joined_at,
        last_seen_at,
        users!inner(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      throw membersError
    }

    // Transform to expected format
    const formattedMembers = members?.map((member: any) => ({
      id: member.id,
      roomId: member.room_id,
      userId: member.user_id,
      role: member.role,
      joinedAt: member.joined_at,
      lastSeenAt: member.last_seen_at,
      user: {
        id: member.users.id,
        fullName: member.users.full_name,
        avatarUrl: member.users.avatar_url,
      },
    })) || []

    return NextResponse.json({ members: formattedMembers })
  } catch (error) {
    console.error('Room members retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rooms/:id/members
 * Joins a room
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

    // Verify room exists
    const { data: room } = await supabase
      .from('study_rooms')
      .select('id, status')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ error: 'Room not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (room.status === 'deleted') {
      return NextResponse.json({ error: 'Room is deleted', code: 'FORBIDDEN' }, { status: 403 })
    }

    await RoomService.joinRoom(roomId, userData.id)

    return NextResponse.json({ success: true, message: 'Joined room successfully' })
  } catch (error) {
    console.error('Room join error:', error)
    
    if (error instanceof Error && error.message.includes('already a member')) {
      return NextResponse.json(
        { error: error.message, code: 'ALREADY_MEMBER' },
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
 * DELETE /api/rooms/:id/members
 * Leaves a room or removes a member (creator only for removal)
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

    const { searchParams } = new URL(request.url)
    const memberIdToRemove = searchParams.get('memberId')

    if (memberIdToRemove) {
      // Creator removing another member
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
          { error: 'Only the room creator can remove members', code: 'FORBIDDEN' },
          { status: 403 }
        )
      }

      if (memberIdToRemove === userData.id) {
        return NextResponse.json(
          { error: 'Creator cannot remove themselves', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }

      await RoomService.removeMember(roomId, memberIdToRemove)
      return NextResponse.json({ success: true, message: 'Member removed successfully' })
    } else {
      // User leaving the room
      await RoomService.leaveRoom(roomId, userData.id)
      return NextResponse.json({ success: true, message: 'Left room successfully' })
    }
  } catch (error) {
    console.error('Room member removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
