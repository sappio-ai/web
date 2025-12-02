import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/mindmaps/:id/nodes/:nodeId
 * Updates a mind map node's title, content, or parent
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: mindmapId, nodeId } = await params

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

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.length < 3 || title.length > 100) {
        return NextResponse.json(
          { error: 'Title must be between 3 and 100 characters' },
          { status: 400 }
        )
      }
    }

    // Validate content if provided
    if (content !== undefined && content !== null) {
      if (typeof content !== 'string' || content.length > 500) {
        return NextResponse.json(
          { error: 'Content must be 500 characters or less' },
          { status: 400 }
        )
      }
    }

    // Verify ownership via mind map -> study pack -> user
    const { data: node, error: nodeError } = await supabase
      .from('mindmap_nodes')
      .select(
        `
        *,
        mindmaps!inner(
          id,
          study_pack_id,
          study_packs!inner(
            id,
            user_id,
            users!inner(id, auth_user_id)
          )
        )
      `
      )
      .eq('id', nodeId)
      .eq('mindmap_id', mindmapId)
      .eq('mindmaps.study_packs.users.auth_user_id', user.id)
      .single()

    if (nodeError || !node) {
      return NextResponse.json(
        { error: 'Node not found or access denied' },
        { status: 404 }
      )
    }

    // If parentId is being changed, validate it
    if (parentId !== undefined) {
      // Allow null parent (root node)
      if (parentId !== null) {
        // Verify parent exists and belongs to same mindmap
        const { data: parentNode, error: parentError } = await supabase
          .from('mindmap_nodes')
          .select('id, parent_id')
          .eq('id', parentId)
          .eq('mindmap_id', mindmapId)
          .single()

        if (parentError || !parentNode) {
          return NextResponse.json(
            { error: 'Invalid parent node' },
            { status: 400 }
          )
        }

        // Prevent circular references - check if new parent is a descendant
        const isCircular = await checkCircularReference(
          supabase,
          nodeId,
          parentId
        )

        if (isCircular) {
          return NextResponse.json(
            { error: 'Cannot create circular reference' },
            { status: 400 }
          )
        }
      }
    }

    // Build update object
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (parentId !== undefined) updates.parent_id = parentId

    // Update the node
    const { data: updatedNode, error: updateError } = await supabase
      .from('mindmap_nodes')
      .update(updates)
      .eq('id', nodeId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update node:', updateError)
      return NextResponse.json(
        { error: 'Failed to update node' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      node: updatedNode,
    })
  } catch (error) {
    console.error('Node update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to check for circular references
 * Returns true if targetParentId is a descendant of nodeId
 */
async function checkCircularReference(
  supabase: any,
  nodeId: string,
  targetParentId: string
): Promise<boolean> {
  // If trying to set parent to self
  if (nodeId === targetParentId) {
    return true
  }

  // Traverse up the tree from targetParentId to see if we reach nodeId
  let currentId: string | null = targetParentId
  const visited = new Set<string>()

  while (currentId) {
    // Prevent infinite loops
    if (visited.has(currentId)) {
      break
    }
    visited.add(currentId)

    // If we reach the node we're trying to move, it's circular
    if (currentId === nodeId) {
      return true
    }

    // Get parent of current node
    const result: { data: { parent_id: string | null } | null; error: any } = await supabase
      .from('mindmap_nodes')
      .select('parent_id')
      .eq('id', currentId)
      .single()

    if (result.error || !result.data) {
      break
    }

    currentId = result.data.parent_id
  }

  return false
}

/**
 * DELETE /api/mindmaps/:id/nodes/:nodeId
 * Deletes a mind map node and all its descendants
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: mindmapId, nodeId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership via mind map -> study pack -> user
    const { data: node, error: nodeError } = await supabase
      .from('mindmap_nodes')
      .select(
        `
        *,
        mindmaps!inner(
          id,
          study_pack_id,
          study_packs!inner(
            id,
            user_id,
            users!inner(id, auth_user_id)
          )
        )
      `
      )
      .eq('id', nodeId)
      .eq('mindmap_id', mindmapId)
      .eq('mindmaps.study_packs.users.auth_user_id', user.id)
      .single()

    if (nodeError || !node) {
      return NextResponse.json(
        { error: 'Node not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the node (cascade will handle descendants via foreign key)
    const { error: deleteError } = await supabase
      .from('mindmap_nodes')
      .delete()
      .eq('id', nodeId)

    if (deleteError) {
      console.error('Failed to delete node:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete node' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Node deleted successfully',
    })
  } catch (error) {
    console.error('Node deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
