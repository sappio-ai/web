import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: quizId } = await params

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get quiz with items and verify ownership
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(
        `
        *,
        quiz_items(*),
        study_packs!inner(
          user_id,
          users!inner(auth_user_id)
        )
      `
      )
      .eq('id', quizId)
      .eq('study_packs.users.auth_user_id', user.id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Remove the study_packs join data and rename quiz_items to items
    const { study_packs, quiz_items, ...quizData } = quiz

    return NextResponse.json({
      quiz: {
        ...quizData,
        items: quiz_items || [],
      },
    })
  } catch (error) {
    console.error('Failed to get quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
