import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/review-sessions
 * Create a new review session
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
    const { study_pack_id, topic_filter } = body

    if (!study_pack_id) {
      return NextResponse.json(
        { error: 'study_pack_id is required' },
        { status: 400 }
      )
    }

    // Verify pack ownership
    const { data: pack } = await supabase
      .from('study_packs')
      .select('id')
      .eq('id', study_pack_id)
      .eq('user_id', userData.id)
      .single()

    if (!pack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Create session record
    const { data: session, error: insertError } = await supabase
      .from('review_sessions')
      .insert({
        user_id: userData.id,
        study_pack_id,
        topic_filter: topic_filter || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Error creating review session:', error)
    return NextResponse.json(
      { error: 'Failed to create review session' },
      { status: 500 }
    )
  }
}
