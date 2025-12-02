import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { responseCache, CACHE_TTL } from '@/lib/utils/cache'

/**
 * GET /api/study-packs/:id/insights
 * Returns pack-specific insights: completeness, weak topics, lapse data, session stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: studyPackId } = await params

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

    // Check cache first
    const cacheKey = `study-pack-insights:${studyPackId}:${user.id}`
    const cached = responseCache.get(cacheKey, 300) // 5 min cache
    if (cached) {
      return NextResponse.json(cached)
    }

    // Verify pack ownership
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('id, stats_json, user_id')
      .eq('id', studyPackId)
      .eq('user_id', userData.id)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Calculate completeness score
    const hasNotes = pack.stats_json?.notes !== null && pack.stats_json?.notes !== undefined
    
    const { count: flashcardsCount } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('study_pack_id', studyPackId)

    const { count: quizzesCount } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('study_pack_id', studyPackId)

    const { count: mindmapsCount } = await supabase
      .from('mindmaps')
      .select('*', { count: 'exact', head: true })
      .eq('study_pack_id', studyPackId)

    const hasFlashcards = (flashcardsCount || 0) > 0
    const hasQuiz = (quizzesCount || 0) > 0
    const hasMindmap = (mindmapsCount || 0) > 0

    const completenessScore =
      (hasNotes ? 25 : 0) +
      (hasFlashcards ? 25 : 0) +
      (hasQuiz ? 25 : 0) +
      (hasMindmap ? 25 : 0)

    // Get weak topics from latest quiz results
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id')
      .eq('study_pack_id', studyPackId)

    let weakTopics: any[] = []
    if (quizzes && quizzes.length > 0) {
      const { data: latestResult } = await supabase
        .from('quiz_results')
        .select('detail_json')
        .eq('quiz_id', quizzes[0].id)
        .eq('user_id', userData.id)
        .order('taken_at', { ascending: false })
        .limit(1)
        .single()

      if (latestResult?.detail_json?.topicPerformance) {
        weakTopics = Object.values(latestResult.detail_json.topicPerformance)
          .filter((t: any) => t.isWeak)
      }
    }

    // Get lapse data (cards with lapses >= 3)
    const { data: lapseCards } = await supabase
      .from('flashcards')
      .select('id, front, topic, lapses, due_at')
      .eq('study_pack_id', studyPackId)
      .gte('lapses', 3)
      .order('lapses', { ascending: false })
      .limit(10)

    const totalLapses = lapseCards?.reduce((sum, card) => sum + card.lapses, 0) || 0

    // Get session stats from review_sessions table (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: reviewSessions } = await supabase
      .from('review_sessions')
      .select('started_at, ended_at, cards_reviewed')
      .eq('user_id', userData.id)
      .eq('study_pack_id', studyPackId)
      .gte('started_at', thirtyDaysAgo.toISOString())

    const totalSessions = reviewSessions?.length || 0
    let totalDuration = 0
    let totalCards = 0

    reviewSessions?.forEach((session) => {
      const startTime = new Date(session.started_at)
      const endTime = session.ended_at ? new Date(session.ended_at) : startTime
      
      const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000
      totalDuration += durationSeconds
      totalCards += session.cards_reviewed || 0
    })

    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0
    const avgCardsPerSession = totalSessions > 0 ? Math.round(totalCards / totalSessions) : 0

    const response = {
      completeness: {
        score: completenessScore,
        items: {
          notes: hasNotes,
          flashcards: hasFlashcards,
          quiz: hasQuiz,
          mindmap: hasMindmap,
        },
      },
      weakTopics,
      lapseData: {
        cards: lapseCards || [],
        totalLapses,
      },
      sessionStats: {
        total: totalSessions,
        avgDuration,
        avgCardsPerSession,
      },
    }

    // Cache the response
    responseCache.set(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Study pack insights error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
