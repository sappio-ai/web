import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const studyPackId = params.id

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify pack ownership
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('user_id')
      .eq('id', studyPackId)
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    if (pack.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get quiz for this pack
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('study_pack_id', studyPackId)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json({ count: 0 })
    }

    // Count quiz items
    const { count, error: countError } = await supabase
      .from('quiz_items')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quiz.id)

    if (countError) {
      console.error('Error counting quiz items:', countError)
      return NextResponse.json(
        { error: 'Failed to count quiz items' },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Error in quiz count endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
