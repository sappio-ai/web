// PATCH /api/flashcards/[id]
// Edit flashcard content

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { front, back } = body as { front?: string; back?: string }

    // Validate input
    if (!front && !back) {
      return NextResponse.json(
        { error: 'At least one field (front or back) is required' },
        { status: 400 }
      )
    }

    if (front && (front.length < 10 || front.length > 150)) {
      return NextResponse.json(
        { error: 'Front text must be between 10 and 150 characters' },
        { status: 400 }
      )
    }

    if (back && (back.length < 20 || back.length > 500)) {
      return NextResponse.json(
        { error: 'Back text must be between 20 and 500 characters' },
        { status: 400 }
      )
    }

    // Fetch the flashcard and verify ownership
    const { data: card, error: cardError } = await supabase
      .from('flashcards')
      .select(
        `
        *,
        study_packs!inner(
          id,
          user_id,
          users!inner(id, auth_user_id)
        )
      `
      )
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      )
    }

    // Verify user owns the study pack
    const studyPack = card.study_packs as any
    if (studyPack.users.auth_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update flashcard (preserve SRS data)
    const updates: { front?: string; back?: string } = {}
    if (front) updates.front = front
    if (back) updates.back = back

    const { data: updatedCard, error: updateError } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
    })
  } catch (error) {
    console.error('Error updating flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    )
  }
}
