// POST /api/flashcards/[id]/review
// Submit flashcard review with grade

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SRSService } from '@/lib/services/SRSService'
import { StreakService } from '@/lib/services/StreakService'
import { XPService } from '@/lib/services/XPService'
import { XP_REWARDS, BADGES, DAILY_XP_GOAL } from '@/lib/constants/badges'
import type { Grade } from '@/lib/types/flashcards'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { grade } = body as { grade: Grade }

    if (!grade || !['again', 'hard', 'good', 'easy'].includes(grade)) {
      return NextResponse.json({ error: 'Invalid grade' }, { status: 400 })
    }

    // Fetch the flashcard and verify ownership
    const { data: card, error: cardError } = await supabase
      .from('flashcards')
      .select(
        `
        *,
        study_packs!inner(
          id,
          user_id,
          users!inner(id, auth_user_id)
        )
      `
      )
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      )
    }

    // Verify user owns the study pack
    const studyPack = card.study_packs as any
    if (studyPack.users.auth_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate new SRS values
    const gradeResult = SRSService.calculateNextReview(card, grade)

    // Update flashcard with new SRS values
    const { error: updateError } = await supabase
      .from('flashcards')
      .update({
        ease: gradeResult.newEase,
        interval_days: gradeResult.newInterval,
        due_at: gradeResult.newDueAt,
        reps: gradeResult.newReps,
        lapses: gradeResult.newLapses,
      })
      .eq('id', cardId)

    if (updateError) {
      throw updateError
    }

    // Update user streak
    const streakData = await StreakService.updateStreak(studyPack.user_id)

    // Award XP and check badges
    let xpData = null
    try {
      const xpResult = await XPService.awardXP(studyPack.user_id, XP_REWARDS.CARD_REVIEWED, 'card_reviewed')
      const newBadges = await XPService.checkAndAwardBadges(studyPack.user_id, {
        streakDays: streakData.currentStreak,
        sessionCardsReviewed: 1,
      })

      xpData = {
        awarded: XP_REWARDS.CARD_REVIEWED,
        totalXp: xpResult.totalXp,
        level: xpResult.level,
        dailyXp: xpResult.dailyXp,
        dailyGoal: DAILY_XP_GOAL,
        leveledUp: xpResult.leveledUp,
        dailyGoalMet: xpResult.dailyGoalMet,
        newBadges: newBadges.map(id => {
          const badge = BADGES.find(b => b.id === id)
          return badge ? { id: badge.id, name: badge.name, icon: badge.icon, color: badge.color } : { id, name: id, icon: 'Star', color: '#5A5FF0' }
        }),
      }
    } catch (xpError) {
      console.error('Error awarding XP:', xpError)
    }

    // Log event
    await supabase.from('events').insert({
      user_id: studyPack.user_id,
      event: 'cards_reviewed',
      props_json: {
        card_id: cardId,
        study_pack_id: studyPack.id,
        grade,
        new_interval: gradeResult.newInterval,
      },
    })

    return NextResponse.json({
      success: true,
      srsValues: gradeResult,
      streak: streakData,
      xp: xpData,
    })
  } catch (error) {
    console.error('Error reviewing flashcard:', error)
    return NextResponse.json(
      { error: 'Failed to review flashcard' },
      { status: 500 }
    )
  }
}
