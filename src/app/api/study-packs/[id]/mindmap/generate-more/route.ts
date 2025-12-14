// POST /api/study-packs/[id]/mindmap/generate-more
// Trigger background generation of additional mind map nodes for a study pack (paid users only)

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

    // 4. Verify user has paid plan (batchNodesSize !== null)
    if (limits.batchNodesSize === null) {
      return NextResponse.json(
        {
          error: 'This feature requires a paid plan',
          message: 'Upgrade to Student Pro or Pro Plus to generate more mind map nodes',
        },
        { status: 403 }
      )
    }

    // 5. Check if generation is already in progress
    const statsJson = (studyPack.stats_json as any) || {}
    const generationStatus = statsJson.generationStatus?.mindmap
    if (generationStatus?.status === 'generating') {
      return NextResponse.json(
        {
          error: 'Generation in progress',
          message: 'Mind map generation is already in progress',
          status: 'generating',
        },
        { status: 409 }
      )
    }

    // 6. Get mindmap ID and count existing nodes
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('study_pack_id', studyPackId)
      .single()

    if (mindmapError || !mindmap) {
      return NextResponse.json(
        { error: 'Mind map not found for this study pack' },
        { status: 404 }
      )
    }

    const { count: currentCount, error: countError } = await supabase
      .from('mindmap_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('mindmap_id', mindmap.id)

    if (countError) {
      throw new Error(`Failed to count mind map nodes: ${countError.message}`)
    }

    const current = currentCount || 0

    // 7. Calculate remaining quota
    const remaining = limits.mindmapNodesLimit - current

    if (remaining <= 0) {
      return NextResponse.json(
        {
          error: 'Maximum limit reached',
          message: `You've already generated all ${limits.mindmapNodesLimit} mind map nodes for this pack`,
          current,
          max: limits.mindmapNodesLimit,
          remaining: 0,
        },
        { status: 409 }
      )
    }

    // 8. Calculate actual generation amount
    const toGenerate = Math.min(limits.batchNodesSize, remaining)

    console.log(
      `[GenerateMoreMindMap] Pack: ${studyPackId}, Current: ${current}, Max: ${limits.mindmapNodesLimit}, Remaining: ${remaining}, ToGenerate: ${toGenerate}`
    )

    // 9. Trigger Inngest background job
    await inngest.send({
      name: 'content/generate-more-mindmap',
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
      message: 'Mind map generation started',
      current,
      toGenerate,
      max: limits.mindmapNodesLimit,
      remaining,
    })
  } catch (error: any) {
    console.error('Error triggering mind map generation:', error)
    return NextResponse.json(
      {
        error: 'Failed to start mind map generation',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
