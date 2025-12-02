// GET /api/study-packs/[id]/flashcards/due
// Fetch cards due for review

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SRSService } from '@/lib/services/SRSService'

export async function GET(
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

    // Verify user owns the study pack
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('id, user_id, users!inner(id, auth_user_id)')
      .eq('id', packId)
      .eq('users.auth_user_id', user.id)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Get topic filter from query params
    const { searchParams } = new URL(request.url)
    const topicFilter = searchParams.get('topic') || undefined

    // Fetch due cards using SRS Service
    const dueCards = await SRSService.getDueCards(packId, topicFilter)

    return NextResponse.json({
      cards: dueCards,
      count: dueCards.length,
    })
  } catch (error) {
    console.error('Error fetching due cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch due cards' },
      { status: 500 }
    )
  }
}
