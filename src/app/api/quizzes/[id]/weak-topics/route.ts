import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

    // Check user plan for weak topics feature
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Weak topics requires student_pro or pro_plus plan
    if (userData.plan === 'free') {
      return NextResponse.json(
        {
          error: 'Weak topics practice requires Student Pro or Pro plan',
          code: 'PLAN_UPGRADE_REQUIRED',
          currentPlan: userData.plan,
          requiredPlan: 'student_pro',
        },
        { status: 403 }
      )
    }

    // Get weak topics from request body
    const body = await request.json()
    const { weakTopics } = body

    if (!weakTopics || !Array.isArray(weakTopics) || weakTopics.length === 0) {
      return NextResponse.json(
        { error: 'Weak topics are required' },
        { status: 400 }
      )
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

    // Filter quiz items to only include weak topics
    const weakTopicItems = (quiz.quiz_items || []).filter((item: any) =>
      weakTopics.includes(item.topic)
    )

    if (weakTopicItems.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for the specified weak topics' },
        { status: 404 }
      )
    }

    // Limit to 5-10 questions per weak topic
    const questionsPerTopic = Math.min(
      10,
      Math.ceil(weakTopicItems.length / weakTopics.length)
    )
    const limitedItems: any[] = []

    weakTopics.forEach((topic) => {
      const topicItems = weakTopicItems.filter(
        (item: any) => item.topic === topic
      )
      limitedItems.push(...topicItems.slice(0, questionsPerTopic))
    })

    // Remove the study_packs join data
    const { study_packs, quiz_items, ...quizData } = quiz

    return NextResponse.json({
      quiz: {
        ...quizData,
        items: limitedItems,
        isWeakTopicQuiz: true,
        weakTopics,
      },
    })
  } catch (error) {
    console.error('Failed to generate weak topic quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
