import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { responseCache, CACHE_TTL } from '@/lib/utils/cache'

/**
 * GET /api/study-packs
 * Returns all study packs for the authenticated user with search, filter, sort, pagination
 */
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all'
    const sort = searchParams.get('sort') || 'updated'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check cache first
    const cacheKey = `study-packs:${user.id}:${search}:${filter}:${sort}:${limit}:${offset}`
    const cached = responseCache.get(cacheKey, CACHE_TTL.STUDY_PACK)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Build base query
    let query = supabase
      .from('study_packs')
      .select(
        `
        id,
        title,
        summary,
        created_at,
        updated_at,
        stats_json
      `,
        { count: 'exact' }
      )
      .eq('user_id', userData.id)

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    // Apply date filter for "recent"
    if (filter === 'recent') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      query = query.gte('updated_at', sevenDaysAgo.toISOString())
    }

    // Apply sorting
    switch (sort) {
      case 'alphabetical':
        query = query.order('title', { ascending: true })
        break
      case 'updated':
      default:
        query = query.order('updated_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: packs, error: packsError, count } = await query

    if (packsError) {
      throw packsError
    }

    // Get all pack IDs for due count calculation
    const packIds = packs?.map((p) => p.id) || []
    const dueCountByPack: Record<string, number> = {}

    if (packIds.length > 0) {
      // Get due cards count for each pack
      const now = new Date().toISOString()
      const { data: dueCards } = await supabase
        .from('flashcards')
        .select('id, study_pack_id')
        .in('study_pack_id', packIds)
        .or(`due_at.is.null,due_at.lte.${now}`)

      // Count due cards per pack
      dueCards?.forEach((card) => {
        dueCountByPack[card.study_pack_id] =
          (dueCountByPack[card.study_pack_id] || 0) + 1
      })
    }

    // Enhance packs with due counts
    let enhancedPacks = (packs || []).map((pack) => ({
      ...pack,
      dueCount: dueCountByPack[pack.id] || 0,
    }))

    // Apply client-side filters that need due count
    if (filter === 'has_due') {
      enhancedPacks = enhancedPacks.filter((pack) => pack.dueCount > 0)
    } else if (filter === 'needs_review') {
      enhancedPacks = enhancedPacks.filter(
        (pack) => (pack.stats_json?.progress || 0) < 50
      )
    }

    // Apply client-side sorting that needs due count
    if (sort === 'due_cards') {
      enhancedPacks.sort((a, b) => b.dueCount - a.dueCount)
    } else if (sort === 'progress') {
      enhancedPacks.sort(
        (a, b) =>
          (b.stats_json?.progress || 0) - (a.stats_json?.progress || 0)
      )
    }

    const response = {
      packs: enhancedPacks,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    }

    // Cache the response
    responseCache.set(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Study packs list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
