// GET /api/flashcards/stats
// Get flashcard statistics and streak data for current user

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SRSService } from '@/lib/services/SRSService'
import { StreakService } from '@/lib/services/StreakService'

export async function GET(request: NextRequest) {
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

    // Get study pack ID from query params (optional)
    const { searchParams } = new URL(request.url)
    const packId = searchParams.get('packId')

    // Fetch all flashcards for the user (or specific pack)
    let query = supabase
      .from('flashcards')
      .select(
        `
        *,
        study_packs!inner(user_id)
      `
      )
      .eq('study_packs.user_id', userData.id)

    if (packId) {
      query = query.eq('study_pack_id', packId)
    }

    const { data: cards, error: cardsError } = await query

    if (cardsError) {
      throw cardsError
    }

    // Calculate progress distribution
    const progress = SRSService.calculateProgress(cards || [])

    // Get streak data
    const streak = await StreakService.getStreak(userData.id)

    // Calculate due cards count
    const now = new Date().toISOString()
    const dueCount = (cards || []).filter(
      (card) => !card.due_at || card.due_at <= now
    ).length

    return NextResponse.json({
      progress,
      streak,
      totalCards: cards?.length || 0,
      dueCount,
    })
  } catch (error) {
    console.error('Error fetching flashcard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
