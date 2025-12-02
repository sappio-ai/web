import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UsageService } from '@/lib/services/UsageService'
import type { PlanTier } from '@/lib/types/usage'

/**
 * GET /api/mindmaps/:id
 * Returns mind map with nodes, applying plan-based node limits
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: mindmapId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get mind map with ownership verification via study pack
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select(
        `
        *,
        study_packs!inner(
          id,
          user_id,
          users!inner(id, auth_user_id, plan)
        )
      `
      )
      .eq('id', mindmapId)
      .eq('study_packs.users.auth_user_id', user.id)
      .single()

    if (mindmapError || !mindmap) {
      return NextResponse.json(
        { error: 'Mind map not found' },
        { status: 404 }
      )
    }

    // Get user plan
    const userPlan = (mindmap.study_packs.users.plan || 'free') as PlanTier

    // Get plan limits
    const planLimits = await UsageService.getPlanLimits(userPlan)
    const nodeLimit = planLimits.mindmapNodesLimit

    // Get all nodes for this mind map
    const { data: allNodes, error: nodesError } = await supabase
      .from('mindmap_nodes')
      .select('*')
      .eq('mindmap_id', mindmapId)
      .order('order_index', { ascending: true })

    if (nodesError) {
      console.error('Failed to fetch mind map nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to fetch mind map nodes' },
        { status: 500 }
      )
    }

    const nodes = allNodes || []
    const totalNodeCount = nodes.length

    // Apply plan-based node limit
    const limitedNodes = nodes.slice(0, nodeLimit)

    // Transform nodes to camelCase
    const transformedNodes = limitedNodes.map((node) => ({
      id: node.id,
      mindmapId: node.mindmap_id,
      parentId: node.parent_id,
      title: node.title,
      content: node.content,
      orderIndex: node.order_index,
      sourceChunkIds: node.source_chunk_ids || [],
    }))

    // Build response
    const response = {
      mindmap: {
        id: mindmap.id,
        studyPackId: mindmap.study_pack_id,
        title: mindmap.title,
        layoutJson: mindmap.layout_json,
        createdAt: mindmap.created_at,
        updatedAt: mindmap.updated_at,
      },
      nodes: transformedNodes,
      nodeCount: totalNodeCount,
      nodeLimit,
      isLimited: totalNodeCount > nodeLimit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Mind map retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
