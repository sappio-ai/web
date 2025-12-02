import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get database user_id
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Optional quiz_id filter
    const quizId = searchParams.get('quiz_id')

    // Build query
    let query = supabase
      .from('quiz_results')
      .select(
        `
        *,
        quizzes(
          id,
          study_pack_id,
          study_packs(title)
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', dbUser.id)
      .order('taken_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (quizId) {
      query = query.eq('quiz_id', quizId)
    }

    const { data: results, error: resultsError, count } = await query

    if (resultsError) {
      throw resultsError
    }

    return NextResponse.json({
      results: results || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Failed to get quiz history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
