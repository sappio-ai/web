import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExportServiceServer } from '@/lib/services/ExportService.server'

/**
 * POST /api/exports/mindmap-markdown
 * Export mind map to Markdown
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const { mindmapId } = await request.json()

    if (!mindmapId) {
      return NextResponse.json(
        { error: 'Mind map ID is required' },
        { status: 400 }
      )
    }

    // Get mind map with ownership verification and user plan
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select(`
        *,
        study_packs!inner(
          id,
          users!inner(id, auth_user_id, plan)
        )
      `)
      .eq('id', mindmapId)
      .eq('study_packs.users.auth_user_id', user.id)
      .single()

    if (mindmapError || !mindmap) {
      return NextResponse.json(
        { error: 'Mind map not found' },
        { status: 404 }
      )
    }

    // Check plan (Student Pro or Pro+ required for exports)
    const userPlan = mindmap.study_packs.users.plan || 'free'
    if (userPlan === 'free') {
      return NextResponse.json(
        {
          error: 'Mind map Markdown export requires Student or Pro plan',
          code: 'PLAN_UPGRADE_REQUIRED',
          currentPlan: userPlan,
          requiredPlan: 'student_pro',
        },
        { status: 403 }
      )
    }

    // Get all nodes
    const { data: nodes, error: nodesError } = await supabase
      .from('mindmap_nodes')
      .select('*')
      .eq('mindmap_id', mindmapId)
      .order('order_index', { ascending: true })

    if (nodesError) {
      return NextResponse.json(
        { error: 'Failed to fetch mind map nodes' },
        { status: 500 }
      )
    }

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: 'No nodes available for this mind map' },
        { status: 404 }
      )
    }

    // Generate Markdown
    const markdown = await ExportServiceServer.generateMindMapMarkdown(
      mindmap.title,
      nodes
    )

    // Return Markdown as response
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${mindmap.title.replace(/[^a-z0-9]/gi, '_')}_mindmap.md"`,
      },
    })
  } catch (error) {
    console.error('Mind map Markdown export error:', error)
    return NextResponse.json(
      { error: 'Failed to export mind map to Markdown' },
      { status: 500 }
    )
  }
}
