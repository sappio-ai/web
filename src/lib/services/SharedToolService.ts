/**
 * SharedToolService - Handles sharing and tracking of study tools in rooms
 * Implements tool sharing, completion tracking, and progress monitoring
 */

import { createClient } from '@/lib/supabase/server'
import { ChatService } from './ChatService'
import type { SharedTool, ToolType, ToolCompletionResult } from '@/lib/types/rooms'
import type { TablesInsert } from '@/lib/types/database'

export class SharedToolService {
  /**
   * Shares a tool in a room (creates shared tool record and chat message)
   */
  static async shareTool(
    roomId: string,
    userId: string,
    toolType: ToolType,
    toolId: string,
    toolName: string,
    studyPackId?: string
  ): Promise<SharedTool> {
    const supabase = await createClient()

    // Verify user is a member of the room
    const { data: member } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    if (!member) {
      throw new Error('User is not a member of this room')
    }

    // Create chat message for the tool share
    const message = await ChatService.sendToolShareMessage(
      roomId,
      userId,
      toolType,
      toolId,
      toolName
    )

    // Create shared tool record
    const sharedToolData: TablesInsert<'room_shared_tools'> = {
      room_id: roomId,
      message_id: message.id,
      sharer_id: userId,
      tool_type: toolType,
      tool_id: toolId,
      tool_name: toolName,
      study_pack_id: studyPackId || null,
      completion_count: 0,
      shared_at: new Date().toISOString(),
    }

    const { data: sharedTool, error } = await supabase
      .from('room_shared_tools')
      .insert(sharedToolData)
      .select(
        `
        *,
        sharer:users!room_shared_tools_sharer_id_fkey (
          full_name,
          avatar_url
        ),
        study_pack:study_packs (
          title
        )
      `
      )
      .single()

    if (error || !sharedTool) {
      throw new Error(`Failed to share tool: ${error?.message}`)
    }

    return this.mapRowToSharedTool(sharedTool)
  }

  /**
   * Gets all shared tools in a room
   * Note: Membership verification should be done at the API route level
   */
  static async getSharedTools(
    roomId: string,
    toolType?: ToolType
  ): Promise<SharedTool[]> {
    const supabase = await createClient()

    let query = supabase
      .from('room_shared_tools')
      .select(
        `
        *,
        sharer:users!room_shared_tools_sharer_id_fkey (
          full_name,
          avatar_url
        ),
        study_pack:study_packs (
          title
        )
      `
      )
      .eq('room_id', roomId)
      .order('shared_at', { ascending: false })

    if (toolType) {
      query = query.eq('tool_type', toolType)
    }

    const { data: sharedTools, error } = await query

    if (error) {
      throw new Error(`Failed to fetch shared tools: ${error.message}`)
    }

    // Get member count for completion percentage
    const { count: memberCount } = await supabase
      .from('room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)

    return (sharedTools || []).map((tool) => ({
      ...this.mapRowToSharedTool(tool),
      totalMembers: memberCount || 0,
    }))
  }

  /**
   * Records a user's completion of a shared tool
   */
  static async recordCompletion(
    sharedToolId: string,
    userId: string,
    result: ToolCompletionResult
  ): Promise<void> {
    const supabase = await createClient()

    // Get shared tool details
    const { data: sharedTool, error: toolError } = await supabase
      .from('room_shared_tools')
      .select('room_id, tool_name, completion_count')
      .eq('id', sharedToolId)
      .single()

    if (toolError || !sharedTool) {
      throw new Error('Shared tool not found')
    }

    // Verify user is a member of the room
    const { data: member } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', sharedTool.room_id)
      .eq('user_id', userId)
      .single()

    if (!member) {
      throw new Error('User is not a member of this room')
    }

    // Increment completion count
    const { error: updateError } = await supabase
      .from('room_shared_tools')
      .update({
        completion_count: sharedTool.completion_count + 1,
      })
      .eq('id', sharedToolId)

    if (updateError) {
      throw new Error(`Failed to update completion count: ${updateError.message}`)
    }

    // Post completion message to chat
    await ChatService.sendCompletionMessage(
      sharedTool.room_id,
      userId,
      sharedTool.tool_name,
      result
    )
  }

  /**
   * Gets completion statistics for a shared tool
   */
  static async getCompletionStats(
    sharedToolId: string,
    userId: string
  ): Promise<{
    completionCount: number
    totalMembers: number
    completionPercentage: number
  }> {
    const supabase = await createClient()

    // Get shared tool
    const { data: sharedTool, error: toolError } = await supabase
      .from('room_shared_tools')
      .select('room_id, completion_count')
      .eq('id', sharedToolId)
      .single()

    if (toolError || !sharedTool) {
      throw new Error('Shared tool not found')
    }

    // Verify user is a member
    const { data: member } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', sharedTool.room_id)
      .eq('user_id', userId)
      .single()

    if (!member) {
      throw new Error('User is not a member of this room')
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', sharedTool.room_id)

    const totalMembers = memberCount || 0
    const completionPercentage =
      totalMembers > 0
        ? Math.round((sharedTool.completion_count / totalMembers) * 100)
        : 0

    return {
      completionCount: sharedTool.completion_count,
      totalMembers,
      completionPercentage,
    }
  }

  /**
   * Checks if a user has completed a shared tool
   * Note: This is a simplified check based on completion messages
   * For more accurate tracking, consider adding a room_tool_completions table
   */
  static async hasUserCompleted(
    sharedToolId: string,
    userId: string
  ): Promise<boolean> {
    const supabase = await createClient()

    // Get shared tool
    const { data: sharedTool } = await supabase
      .from('room_shared_tools')
      .select('room_id, tool_name')
      .eq('id', sharedToolId)
      .single()

    if (!sharedTool) {
      return false
    }

    // Check for completion message from this user
    const { data: completionMessage } = await supabase
      .from('room_messages')
      .select('id')
      .eq('room_id', sharedTool.room_id)
      .eq('user_id', userId)
      .eq('message_type', 'completion')
      .ilike('content', `%${sharedTool.tool_name}%`)
      .single()

    return !!completionMessage
  }

  /**
   * Maps a database row to SharedTool
   */
  private static mapRowToSharedTool(row: any): SharedTool {
    return {
      id: row.id,
      roomId: row.room_id,
      messageId: row.message_id,
      sharerId: row.sharer_id,
      sharer: row.sharer
        ? {
            fullName: row.sharer.full_name,
            avatarUrl: row.sharer.avatar_url,
          }
        : undefined,
      toolType: row.tool_type,
      toolId: row.tool_id,
      toolName: row.tool_name,
      studyPackId: row.study_pack_id,
      studyPack: row.study_pack
        ? {
            title: row.study_pack.title,
          }
        : undefined,
      completionCount: row.completion_count,
      sharedAt: row.shared_at,
    }
  }
}
