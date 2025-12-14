// POST /api/study-packs/[id]/flashcards/generate-more
// Trigger background generation of additional flashcards for a study pack (paid users only)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UsageService } from '@/lib/services/UsageService'
import { inngest } from '@/lib/inngest/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studyPackId } = await params
    const supabase = await createClient()

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch study pack and verify ownership
    const { data: studyPack, error: packError } = await supabase
      .from('study_packs')
      .select(
        `
        id,
        material_id,
        stats_json,
        users!inner(id, auth_user_id, plan)
      `
      )
      .eq('id', studyPackId)
      .single()

    if (packError || !studyPack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const owner = studyPack.users as any
    if (owner.auth_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Get user's plan limits
    const limits = await UsageService.getPlanLimits(owner.plan)

    // 4. Verify user has paid plan (batchCardsSize !== null)
    if (limits.batchCardsSize === null) {
      return NextResponse.json(
        {
          error: 'This feature requires a paid plan',
          message: 'Upgrade to Student Pro or Pro Plus to generate more flashcards',
        },
        { status: 403 }
      )
    }

    // 5. Check if generation is already in progress
    const statsJson = (studyPack.stats_json as any) || {}
    const generationStatus = statsJson.generationStatus?.flashcards
    if (generationStatus?.status === 'generating') {
      return NextResponse.json(
        {
          error: 'Generation in progress',
          message: 'Flashcard generation is already in progress',
          status: 'generating',
        },
        { status: 409 }
      )
    }

    // 6. Count existing flashcards
    const { count: currentCount, error: countError } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('study_pack_id', studyPackId)

    if (countError) {
      throw new Error(`Failed to count flashcards: ${countError.message}`)
    }

    const current = currentCount || 0

    // 7. Calculate remaining quota
    const remaining = limits.cardsPerPack - current

    if (remaining <= 0) {
      return NextResponse.json(
        {
          error: 'Maximum limit reached',
          message: `You've already generated all ${limits.cardsPerPack} flashcards for this pack`,
          current,
          max: limits.cardsPerPack,
          remaining: 0,
        },
        { status: 409 }
      )
    }

    // 8. Calculate actual generation amount
    const toGenerate = Math.min(limits.batchCardsSize, remaining)

    console.log(
      `[GenerateMoreFlashcards] Pack: ${studyPackId}, Current: ${current}, Max: ${limits.cardsPerPack}, Remaining: ${remaining}, ToGenerate: ${toGenerate}`
    )

    // 9. Trigger Inngest background job
    await inngest.send({
      name: 'content/generate-more-flashcards',
      data: {
        studyPackId,
        userId: owner.id,
        batchSize: toGenerate,
      },
    })

    // 10. Return immediately with status
    return NextResponse.json({
      success: true,
      status: 'generating',
      message: 'Flashcard generation started',
      current,
      toGenerate,
      max: limits.cardsPerPack,
      remaining,
    })
  } catch (error: any) {
    console.error('Error triggering flashcard generation:', error)
    return NextResponse.json(
      {
        error: 'Failed to start flashcard generation',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
