import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/review-sessions/:id
 * Update a review session with final stats
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { cards_reviewed, accuracy } = body

    // Verify session ownership and update
    const { data: session, error: updateError } = await supabase
      .from('review_sessions')
      .update({
        ended_at: new Date().toISOString(),
        cards_reviewed: cards_reviewed || 0,
        accuracy: accuracy || null,
      })
      .eq('id', sessionId)
      .eq('user_id', userData.id)
      .select()
      .single()

    if (updateError || !session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session,
    })
  } catch (error) {
    console.error('Error updating review session:', error)
    return NextResponse.json(
      { error: 'Failed to update review session' },
      { status: 500 }
    )
  }
}
