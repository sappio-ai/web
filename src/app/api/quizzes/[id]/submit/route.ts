import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { QuizGradingService } from '@/lib/services/QuizGradingService'
import type { Quiz } from '@/lib/types/quiz'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: quizId } = await params
    const { answers, startTime } = await request.json()

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

    // Convert answers array to Map
    const answersMap = new Map<string, string>(
      answers.map((a: { questionId: string; answer: string }) => [
        a.questionId,
        a.answer,
      ])
    )

    // Prepare quiz data for grading
    const quizData: Quiz = {
      id: quiz.id,
      study_pack_id: quiz.study_pack_id,
      config_json: quiz.config_json,
      created_at: quiz.created_at,
      items: quiz.quiz_items,
    }

    // Calculate results
    const result = QuizGradingService.calculateResults(
      quizData,
      answersMap,
      startTime
    )

    // Get database user_id from study_pack
    const dbUserId = quiz.study_packs.user_id

    // Save result
    const { data: savedResult, error: saveError } = await supabase
      .from('quiz_results')
      .insert({
        quiz_id: quizId,
        user_id: dbUserId,
        score: result.score,
        duration_s: result.duration_s,
        detail_json: result.detail_json,
      })
      .select()
      .single()

    if (saveError) {
      throw saveError
    }

    // Update weekly challenge progress
    try {
      const { ChallengeService } = await import('@/lib/services/ChallengeService')
      await ChallengeService.updateProgress(dbUserId, 'quiz_completed')
      await ChallengeService.updateProgress(dbUserId, 'quiz_score', result.score)
    } catch (challengeErr) {
      console.error('Challenge update error:', challengeErr)
    }

    // Log event
    await supabase.from('events').insert({
      user_id: dbUserId,
      event: 'quiz_completed',
      props_json: {
        quiz_id: quizId,
        score: result.score,
        duration: result.duration_s,
      },
    })

    return NextResponse.json({
      success: true,
      result: savedResult,
    })
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
