import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InviteService } from '@/lib/services/InviteService'

/**
 * GET /api/invites/:token
 * Returns invite details by token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    const invite = await InviteService.getInviteByToken(token)

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Check if invite is expired
    if (invite.status === 'expired' || new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired', code: 'INVITE_EXPIRED' }, { status: 400 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is no longer valid', code: 'INVITE_EXPIRED' }, { status: 400 })
    }

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Invite retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invites/:token
 * Accepts an invite and joins the room
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

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

    const result = await InviteService.acceptInvite(token, userData.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Invite accepted successfully',
      roomId: result.roomId 
    })
  } catch (error) {
    console.error('Invite acceptance error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { error: error.message, code: 'INVITE_EXPIRED' },
          { status: 400 }
        )
      }
      if (error.message.includes('already a member')) {
        return NextResponse.json(
          { error: error.message, code: 'ALREADY_MEMBER' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/invites/:token
 * Declines an invite
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

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

    await InviteService.declineInvite(token, userData.id)

    return NextResponse.json({ success: true, message: 'Invite declined successfully' })
  } catch (error) {
    console.error('Invite decline error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
