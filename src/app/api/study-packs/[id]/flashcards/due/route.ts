// GET /api/study-packs/[id]/flashcards/due
// Fetch cards due for review

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { SRSService } from '@/lib/services/SRSService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packId } = await params
    const supabase = await createClient()

    // Get topic filter from query params
    const { searchParams } = new URL(request.url)
    const topicFilter = searchParams.get('topic') || undefined

    const demoId = process.env.NEXT_PUBLIC_DEMO_PACK_ID || '3747df11-0426-4749-8597-af89639e8d38'
    const isDemo = packId === demoId
    let dueCards = []

    if (isDemo) {
      // DEMO MODE: Bypass Auth & Service
      const adminSupabase = createServiceRoleClient()

      let query = adminSupabase
        .from('flashcards')
        .select('*')
        .eq('study_pack_id', packId)
        // Just return all cards or simulate scheduled ones
        .order('created_at', { ascending: true })
        .limit(20) // Limit to 20 for demo

      if (topicFilter) {
        query = query.eq('topic', topicFilter)
      }

      const { data, error } = await query
      if (error) {
        console.error('Demo fetch error', error)
        throw error
      }
      dueCards = data || []
    } else {
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

      // Fetch due cards using SRS Service
      dueCards = await SRSService.getDueCards(packId, topicFilter)
    }

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
