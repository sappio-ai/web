import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { responseCache, CACHE_TTL } from '@/lib/utils/cache'

/**
 * GET /api/materials/:id/status
 * Returns material processing status and progress information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: materialId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check cache first (10 second TTL for status polling)
    const cacheKey = `material-status:${materialId}:${user.id}`
    const cached = responseCache.get(cacheKey, CACHE_TTL.MATERIAL_STATUS)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Get material with ownership verification
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('*, users!inner(id)')
      .eq('id', materialId)
      .eq('users.auth_user_id', user.id)
      .single()

    if (materialError || !material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    // Map status to progress percentage and stage name
    const statusMap: Record<
      string,
      { progress: number; stage: string; description: string }
    > = {
      uploading: {
        progress: 10,
        stage: 'Uploading',
        description: 'Uploading your file...',
      },
      processing: {
        progress: 25,
        stage: 'Processing',
        description: 'Extracting text from your material...',
      },
      chunking: {
        progress: 50,
        stage: 'Analyzing',
        description: 'Breaking content into chunks...',
      },
      ready: {
        progress: 75,
        stage: 'Generating',
        description: 'Creating your study pack...',
      },
      failed: {
        progress: 0,
        stage: 'Failed',
        description: 'Processing failed. Please try again.',
      },
    }

    const statusInfo =
      statusMap[material.status] || statusMap.processing

    // Check if study pack exists and has content (means generation is complete)
    const { data: studyPack } = await supabase
      .from('study_packs')
      .select('id, created_at, stats_json')
      .eq('material_id', materialId)
      .single()

    // Check if flashcards have been generated (indicates completion)
    let hasContent = false
    if (studyPack) {
      const { count: flashcardCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('study_pack_id', studyPack.id)
      
      // Consider complete if has flashcards OR has notes in stats_json
      hasContent = (flashcardCount && flashcardCount > 0) || !!studyPack.stats_json?.notes
    }

    const isComplete = !!studyPack && hasContent
    const progress = isComplete ? 100 : statusInfo.progress
    const stage = isComplete ? 'Complete' : statusInfo.stage
    const description = isComplete
      ? 'Your study pack is ready!'
      : statusInfo.description

    // Estimate time remaining (rough estimate)
    let estimatedTimeRemaining: number | null = null
    if (!isComplete && material.status !== 'failed') {
      const remainingProgress = 100 - progress
      estimatedTimeRemaining = Math.ceil((remainingProgress / 100) * 45) // ~45s total
    }

    const response = {
      materialId: material.id,
      status: material.status,
      progress,
      stage,
      description,
      isComplete,
      studyPackId: studyPack?.id || null,
      estimatedTimeRemaining,
      error: material.meta_json?.error || null,
      createdAt: material.created_at,
    }

    // Cache the response (10 seconds for status polling)
    responseCache.set(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
