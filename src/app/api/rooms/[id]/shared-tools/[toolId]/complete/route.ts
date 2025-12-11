import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChatService } from '@/lib/services/ChatService'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; toolId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: roomId, toolId } = await params
    const body = await request.json()
    const { result } = body

    // Verify user is a member of the room
    const { data: membership, error: memberError } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 })
    }

    // Get the shared tool
    const { data: sharedTool, error: toolError } = await supabase
      .from('room_shared_tools')
      .select('*, study_packs(title)')
      .eq('id', toolId)
      .single()

    if (toolError || !sharedTool) {
      return NextResponse.json({ error: 'Shared tool not found' }, { status: 404 })
    }

    // Check if user already completed this tool
    const { data: existingCompletion } = await supabase
      .from('room_tool_completions')
      .select('id')
      .eq('shared_tool_id', toolId)
      .eq('user_id', user.id)
      .single()

    if (!existingCompletion) {
      // Record completion
      const { error: completionError } = await supabase
        .from('room_tool_completions')
        .insert({
          shared_tool_id: toolId,
          user_id: user.id,
          result_json: result,
        })

      if (completionError) {
        console.error('Error recording completion:', completionError)
        return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 })
      }

      // Update completion count
      const { error: updateError } = await supabase
        .from('room_shared_tools')
        .update({
          completion_count: (sharedTool.completion_count || 0) + 1,
        })
        .eq('id', toolId)

      if (updateError) {
        console.error('Error updating completion count:', updateError)
      }

      // Post completion message to chat
      let completionMessage = ''
      if (sharedTool.tool_type === 'quiz' && result.score !== undefined) {
        completionMessage = `completed the quiz "${sharedTool.tool_name}" with a score of ${Math.round(result.score)}%`
      } else if (sharedTool.tool_type === 'flashcards' && result.cardsReviewed !== undefined) {
        completionMessage = `reviewed ${result.cardsReviewed} flashcard${result.cardsReviewed !== 1 ? 's' : ''} from "${sharedTool.tool_name}"`
      } else if (sharedTool.tool_type === 'notes') {
        completionMessage = `viewed the notes "${sharedTool.tool_name}"`
      }

      if (completionMessage) {
        await ChatService.sendSystemMessage(
          roomId,
          user.id,
          completionMessage
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing shared tool:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
