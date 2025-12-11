/**
 * ChatService - Handles real-time chat and messaging in study rooms
 * Implements message sending, retrieval, and real-time subscriptions
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Message,
  SendMessageInput,
  MessageType,
  ToolType,
} from '@/lib/types/rooms'
import type { TablesInsert } from '@/lib/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export class ChatService {
  /**
   * Sends a text message to a room
   */
  static async sendMessage(
    roomId: string,
    userId: string,
    input: SendMessageInput
  ): Promise<Message> {
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

    // Validate message content
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Message content cannot be empty')
    }

    // Create message record
    const messageData: TablesInsert<'room_messages'> = {
      room_id: roomId,
      user_id: userId,
      message_type: input.messageType || 'text',
      content: input.content.trim(),
      created_at: new Date().toISOString(),
      meta_json: {},
    }

    const { data: message, error } = await supabase
      .from('room_messages')
      .insert(messageData)
      .select(
        `
        *,
        user:users!room_messages_user_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .single()

    if (error || !message) {
      throw new Error(`Failed to send message: ${error?.message}`)
    }

    // Update room last activity
    await supabase
      .from('study_rooms')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', roomId)

    return this.mapRowToMessage(message)
  }

  /**
   * Sends a system message (join/leave/tool result)
   */
  static async sendSystemMessage(
    roomId: string,
    userId: string,
    content: string,
    metaJson?: Record<string, any>
  ): Promise<Message> {
    const supabase = await createClient()

    const messageData: TablesInsert<'room_messages'> = {
      room_id: roomId,
      user_id: userId,
      message_type: 'system',
      content,
      created_at: new Date().toISOString(),
      meta_json: metaJson || {},
    }

    const { data: message, error } = await supabase
      .from('room_messages')
      .insert(messageData)
      .select(
        `
        *,
        user:users!room_messages_user_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .single()

    if (error || !message) {
      throw new Error(`Failed to send system message: ${error?.message}`)
    }

    return this.mapRowToMessage(message)
  }

  /**
   * Sends a tool share message
   */
  static async sendToolShareMessage(
    roomId: string,
    userId: string,
    toolType: ToolType,
    toolId: string,
    toolName: string
  ): Promise<Message> {
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

    const messageData: TablesInsert<'room_messages'> = {
      room_id: roomId,
      user_id: userId,
      message_type: 'tool_share',
      content: `shared a ${toolType}`,
      tool_type: toolType,
      tool_id: toolId,
      tool_name: toolName,
      created_at: new Date().toISOString(),
      meta_json: {},
    }

    const { data: message, error } = await supabase
      .from('room_messages')
      .insert(messageData)
      .select(
        `
        *,
        user:users!room_messages_user_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .single()

    if (error || !message) {
      throw new Error(`Failed to send tool share message: ${error?.message}`)
    }

    // Update room last activity
    await supabase
      .from('study_rooms')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', roomId)

    return this.mapRowToMessage(message)
  }

  /**
   * Sends a completion message when a user completes a shared tool
   */
  static async sendCompletionMessage(
    roomId: string,
    userId: string,
    toolName: string,
    result: Record<string, any>
  ): Promise<Message> {
    const supabase = await createClient()

    // Get user name for the message
    const { data: user } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single()

    const userName = user?.full_name || 'Someone'
    const content = `${userName} completed ${toolName}`

    const messageData: TablesInsert<'room_messages'> = {
      room_id: roomId,
      user_id: userId,
      message_type: 'completion',
      content,
      created_at: new Date().toISOString(),
      meta_json: result,
    }

    const { data: message, error } = await supabase
      .from('room_messages')
      .insert(messageData)
      .select(
        `
        *,
        user:users!room_messages_user_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .single()

    if (error || !message) {
      throw new Error(`Failed to send completion message: ${error?.message}`)
    }

    return this.mapRowToMessage(message)
  }

  /**
   * Gets paginated message history for a room
   */
  static async getMessages(
    roomId: string,
    limit: number = 50
  ): Promise<Message[]> {
    const supabase = await createClient()

    const { data: messages, error } = await supabase
      .from('room_messages')
      .select(
        `
        *,
        user:users!room_messages_user_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    // Reverse to get chronological order
    return (messages || []).reverse().map(this.mapRowToMessage)
  }

  /**
   * Gets a single message by ID
   */
  static async getMessageById(
    roomId: string,
    messageId: string
  ): Promise<Message | null> {
    const supabase = await createClient()

    const { data: message, error } = await supabase
      .from('room_messages')
      .select(
        `
        *,
        user:users!room_messages_user_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .eq('id', messageId)
      .eq('room_id', roomId)
      .single()

    if (error || !message) {
      return null
    }

    return this.mapRowToMessage(message)
  }

  /**
   * Subscribes to new messages in a room (client-side only)
   * This method signature is for documentation - actual implementation
   * will be in client components using Supabase Realtime
   */
  static getSubscriptionConfig(roomId: string) {
    return {
      channel: `room:${roomId}:messages`,
      table: 'room_messages',
      filter: `room_id=eq.${roomId}`,
      event: 'INSERT',
    }
  }

  /**
   * Maps a database row to a Message interface
   */
  private static mapRowToMessage(row: any): Message {
    return {
      id: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      user: row.user
        ? {
            fullName: row.user.full_name,
            avatarUrl: row.user.avatar_url,
          }
        : undefined,
      messageType: row.message_type,
      content: row.content,
      toolType: row.tool_type,
      toolId: row.tool_id,
      toolName: row.tool_name,
      createdAt: row.created_at,
      metaJson: row.meta_json || {},
    }
  }
}
