// GET /api/study-packs/[id]/flashcards/topics
// Get list of topics with card counts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get all flashcards with topics
    const { data: cards, error: cardsError } = await supabase
      .from('flashcards')
      .select('topic, due_at')
      .eq('study_pack_id', packId)
      .not('topic', 'is', null)

    if (cardsError) {
      throw cardsError
    }

    const now = new Date()

    // Count total and due cards per topic
    const topicData = (cards || []).reduce(
      (acc, card) => {
        const topic = card.topic as string
        if (!acc[topic]) {
          acc[topic] = { total: 0, due: 0 }
        }
        acc[topic].total++

        // Check if card is due (null due_at means new card, always due)
        if (!card.due_at) {
          acc[topic].due++
        } else {
          const dueDate = new Date(card.due_at)
          if (dueDate <= now) {
            acc[topic].due++
          }
        }
        return acc
      },
      {} as Record<string, { total: number; due: number }>
    )

    // Convert to array format
    const topics = Object.entries(topicData).map(([topic, counts]) => ({
      topic,
      totalCount: counts.total,
      dueCount: counts.due,
    }))

    return NextResponse.json({ topics })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}
