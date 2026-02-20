// POST /api/study-packs/[id]/flashcards
// Manually create a flashcard in a study pack

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packId } = await params
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the study pack and get their plan
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('id, user_id, stats_json, users!inner(id, auth_user_id, plan)')
      .eq('id', packId)
      .eq('users.auth_user_id', user.id)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Check plan - must be student_pro or pro_plus
    const userPlan = (pack as any).users?.plan || 'free'
    if (userPlan === 'free') {
      return NextResponse.json(
        { error: 'Manual card creation requires a Student Pro or Pro Plus plan' },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const { front, back, topic } = body

    if (!front || typeof front !== 'string' || front.trim().length < 10 || front.trim().length > 500) {
      return NextResponse.json(
        { error: 'Front must be between 10 and 500 characters' },
        { status: 400 }
      )
    }

    if (!back || typeof back !== 'string' || back.trim().length < 10 || back.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Back must be between 10 and 1000 characters' },
        { status: 400 }
      )
    }

    // Insert the flashcard using service role to bypass RLS
    const adminSupabase = createServiceRoleClient()

    const { data: card, error: insertError } = await adminSupabase
      .from('flashcards')
      .insert({
        study_pack_id: packId,
        front: front.trim(),
        back: back.trim(),
        kind: 'qa',
        topic: topic && typeof topic === 'string' ? topic.trim() : null,
        ease: 2.5,
        interval_days: 0,
        due_at: new Date().toISOString(),
        reps: 0,
        lapses: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting flashcard:', insertError)
      return NextResponse.json(
        { error: 'Failed to create flashcard' },
        { status: 500 }
      )
    }

    // Update stats_json cardCount
    const currentStats = pack.stats_json || {}
    const currentCardCount = currentStats.cardCount || 0

    const { error: updateError } = await adminSupabase
      .from('study_packs')
      .update({
        stats_json: {
          ...currentStats,
          cardCount: currentCardCount + 1,
        },
      })
      .eq('id', packId)

    if (updateError) {
      console.error('Error updating stats_json:', updateError)
      // Non-fatal - card was still created
    }

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    )
  }
}
