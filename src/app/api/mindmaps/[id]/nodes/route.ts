import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UsageService } from '@/lib/services/UsageService'
import type { PlanTier } from '@/lib/types/usage'

/**
 * POST /api/mindmaps/:id/nodes
 * Creates a new mind map node
 */
export async function POST(
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

    // Parse request body
    const body = await request.json()
    const { title, content, parentId } = body

    // Validate title (required)
    if (!title || typeof title !== 'string' || title.length < 3 || title.length > 100) {
      return NextResponse.json(
        { error: 'Title is required and must be between 3 and 100 characters' },
        { status: 400 }
      )
    }

    // Validate content (optional)
    if (content !== undefined && content !== null) {
      if (typeof content !== 'string' || content.length > 500) {
        return NextResponse.json(
          { error: 'Content must be 500 characters or less' },
          { status: 400 }
        )
      }
    }

    // Verify ownership via mind map -> study pack -> user
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
        { error: 'Mind map not found or access denied' },
        { status: 404 }
      )
    }

    // Get user plan and check limits
    const userPlan = (mindmap.study_packs.users.plan || 'free') as PlanTier
    const planLimits = await UsageService.getPlanLimits(userPlan)
    const nodeLimit = planLimits.mindmapNodesLimit

    // Count existing nodes
    const { count: nodeCount, error: countError } = await supabase
      .from('mindmap_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('mindmap_id', mindmapId)

    if (countError) {
      console.error('Failed to count nodes:', countError)
      return NextResponse.json(
        { error: 'Failed to check node limit' },
        { status: 500 }
      )
    }

    // Check if limit reached
    if (nodeCount !== null && nodeCount >= nodeLimit) {
      return NextResponse.json(
        {
          error: 'Node limit reached for your plan',
          code: 'NODE_LIMIT_REACHED',
          limit: nodeLimit,
          current: nodeCount,
        },
        { status: 403 }
      )
    }

    // If parentId provided, verify it exists
    if (parentId) {
      const { data: parentNode, error: parentError } = await supabase
        .from('mindmap_nodes')
        .select('id')
        .eq('id', parentId)
        .eq('mindmap_id', mindmapId)
        .single()

      if (parentError || !parentNode) {
        return NextResponse.json(
          { error: 'Invalid parent node' },
          { status: 400 }
        )
      }
    }

    // Get max order_index for new node
    const { data: maxOrderNode } = await supabase
      .from('mindmap_nodes')
      .select('order_index')
      .eq('mindmap_id', mindmapId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const orderIndex = (maxOrderNode?.order_index ?? -1) + 1

    // Create the node
    const { data: newNode, error: createError } = await supabase
      .from('mindmap_nodes')
      .insert({
        mindmap_id: mindmapId,
        parent_id: parentId || null,
        title,
        content: content || null,
        order_index: orderIndex,
        source_chunk_ids: [],
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create node:', createError)
      return NextResponse.json(
        { error: 'Failed to create node' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      node: newNode,
    })
  } catch (error) {
    console.error('Node creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
