import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SharedToolService } from '@/lib/services/SharedToolService'

/**
 * GET /api/rooms/:id/shared-tools
 * Returns all shared tools in a room
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: roomId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Get user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Verify user is a member
    const { data: membership } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userData.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const toolType = searchParams.get('type') // 'quiz', 'flashcards', 'notes', or null for all

    const sharedTools = toolType 
      ? await SharedToolService.getSharedTools(roomId, toolType)
      : await SharedToolService.getSharedTools(roomId)

    return NextResponse.json({ sharedTools })
  } catch (error) {
    console.error('Shared tools retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rooms/:id/shared-tools
 * Shares a tool in a room
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: roomId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Get user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Verify user is a member
    const { data: membership } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userData.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 })
    }

    const body = await request.json()
    const { toolType, toolId, toolName, studyPackId } = body

    // Validate required fields
    if (!toolType || !['quiz', 'flashcards', 'notes'].includes(toolType)) {
      return NextResponse.json(
        { error: 'Valid toolType is required (quiz, flashcards, or notes)', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    if (!toolId || typeof toolId !== 'string') {
      return NextResponse.json(
        { error: 'toolId is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    if (!toolName || typeof toolName !== 'string') {
      return NextResponse.json(
        { error: 'toolName is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    if (!studyPackId || typeof studyPackId !== 'string') {
      return NextResponse.json(
        { error: 'studyPackId is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Verify the study pack belongs to the user
    const { data: studyPack } = await supabase
      .from('study_packs')
      .select('id')
      .eq('id', studyPackId)
      .eq('user_id', userData.id)
      .single()

    if (!studyPack) {
      return NextResponse.json(
        { error: 'Study pack not found or access denied', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const sharedTool = await SharedToolService.shareTool(
      roomId,
      userData.id,
      toolType,
      toolId,
      toolName,
      studyPackId
    )

    return NextResponse.json({ sharedTool }, { status: 201 })
  } catch (error) {
    console.error('Tool sharing error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
