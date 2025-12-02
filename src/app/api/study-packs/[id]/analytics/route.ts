import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { responseCache, CACHE_TTL } from '@/lib/utils/cache'

/**
 * GET /api/study-packs/:id/analytics
 * Returns time-series analytics: quiz performance, due load forecast, session patterns
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Check cache first
    const cacheKey = `study-pack-analytics:${studyPackId}:${user.id}:${startDate}:${endDate}`
    const cached = responseCache.get(cacheKey, 300) // 5 min cache
    if (cached) {
      return NextResponse.json(cached)
    }

    // Verify pack ownership
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('id, user_id')
      .eq('id', studyPackId)
      .eq('user_id', userData.id)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Get quiz performance over time
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id')
      .eq('study_pack_id', studyPackId)

    let quizPerformance: any[] = []
    if (quizzes && quizzes.length > 0) {
      let resultsQuery = supabase
        .from('quiz_results')
        .select('taken_at, score, duration_s')
        .eq('quiz_id', quizzes[0].id)
        .eq('user_id', userData.id)
        .order('taken_at', { ascending: true })

      if (startDate) {
        resultsQuery = resultsQuery.gte('taken_at', startDate)
      }
      if (endDate) {
        resultsQuery = resultsQuery.lte('taken_at', endDate)
      }

      const { data: results } = await resultsQuery

      quizPerformance = (results || []).map((r) => ({
        date: r.taken_at,
        score: r.score,
        duration: r.duration_s,
      }))
    }

    // Get due load forecast (next 7 days)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    const { data: dueCards } = await supabase
      .from('flashcards')
      .select('due_at, study_pack_id')
      .eq('study_pack_id', studyPackId)
      .gte('due_at', today.toISOString())
      .lte('due_at', sevenDaysLater.toISOString())

    // Group by date
    const dueByDate: Record<string, number> = {}
    dueCards?.forEach((card) => {
      if (card.due_at) {
        const date = new Date(card.due_at).toISOString().split('T')[0]
        dueByDate[date] = (dueByDate[date] || 0) + 1
      }
    })

    // Build forecast for next 7 days
    const dueLoadForecast = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

      dueLoadForecast.push({
        date: dateStr,
        dayName,
        dueCount: dueByDate[dateStr] || 0,
        packBreakdown: {
          [studyPackId]: dueByDate[dateStr] || 0,
        },
      })
    }

    // Get session patterns (last 30 days) from review_sessions table
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: reviewSessions } = await supabase
      .from('review_sessions')
      .select('started_at, ended_at, cards_reviewed, study_pack_id')
      .eq('user_id', userData.id)
      .eq('study_pack_id', studyPackId)
      .gte('started_at', thirtyDaysAgo.toISOString())
      .order('started_at', { ascending: true })

    // Aggregate by day of week and hour of day
    const byDayOfWeek: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    }
    const byHourOfDay: Record<string, number> = {}

    // Initialize hours
    for (let i = 0; i < 24; i++) {
      byHourOfDay[i.toString()] = 0
    }

    // Calculate session statistics
    const totalSessions = reviewSessions?.length || 0
    let totalDuration = 0
    let totalCards = 0

    reviewSessions?.forEach((session) => {
      const startTime = new Date(session.started_at)
      const endTime = session.ended_at ? new Date(session.ended_at) : startTime
      
      // Calculate duration in seconds
      const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000
      totalDuration += durationSeconds
      totalCards += session.cards_reviewed || 0

      // Count sessions by day and hour (using start time)
      const dayName = startTime.toLocaleDateString('en-US', { weekday: 'short' })
      const hour = startTime.getHours()

      byDayOfWeek[dayName] = (byDayOfWeek[dayName] || 0) + 1
      byHourOfDay[hour.toString()] = (byHourOfDay[hour.toString()] || 0) + 1
    })

    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0
    const avgCardsPerSession = totalSessions > 0 ? Math.round(totalCards / totalSessions) : 0

    const response = {
      quizPerformance,
      dueLoadForecast,
      sessionPatterns: {
        total: totalSessions,
        avgDuration,
        avgCardsPerSession,
        byDayOfWeek,
        byHourOfDay,
      },
    }

    // Cache the response
    responseCache.set(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Study pack analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
