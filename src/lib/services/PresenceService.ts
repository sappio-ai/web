/**
 * PresenceService - Handles real-time presence tracking for room members
 * Implements online status and activity state management
 */

import { createClient } from '@/lib/supabase/server'
import type { PresenceState, MemberStatus } from '@/lib/types/rooms'

export class PresenceService {
  /**
   * Updates the last seen timestamp for a member
   */
  static async updateLastSeen(roomId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('room_members')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to update last seen: ${error.message}`)
    }
  }

  /**
   * Gets presence information for all room members
   * Note: This returns database-stored last_seen_at. For real-time presence,
   * use Supabase Realtime Presence on the client side.
   */
  static async getRoomPresence(
    roomId: string,
    userId: string
  ): Promise<PresenceState[]> {
    const supabase = await createClient()

    // Verify user is a member
    const { data: member } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    if (!member) {
      throw new Error('User is not a member of this room')
    }

    // Get all members with user details
    const { data: members, error } = await supabase
      .from('room_members')
      .select(
        `
        user_id,
        last_seen_at,
        user:users!room_members_user_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .eq('room_id', roomId)

    if (error) {
      throw new Error(`Failed to fetch presence: ${error.message}`)
    }

    // Map to presence state
    const now = new Date()
    return (members || []).map((m: any) => {
      const lastSeen = m.last_seen_at ? new Date(m.last_seen_at) : null
      const isOnline = lastSeen
        ? now.getTime() - lastSeen.getTime() < 5 * 60 * 1000 // 5 minutes
        : false

      return {
        userId: m.user_id,
        user: {
          fullName: m.user.full_name,
          avatarUrl: m.user.avatar_url,
        },
        status: isOnline ? 'idle' : 'offline',
        lastSeen: m.last_seen_at || now.toISOString(),
      }
    })
  }

  /**
   * Returns subscription configuration for real-time presence
   * This method signature is for documentation - actual implementation
   * will be in client components using Supabase Realtime Presence
   */
  static getPresenceConfig(roomId: string) {
    return {
      channel: `room:${roomId}:presence`,
      // Presence is tracked via Supabase Realtime Presence API
      // Client will call channel.track({ user_id, status, timer_running })
    }
  }

  /**
   * Helper to determine if a user is considered online
   * based on last_seen_at timestamp
   */
  static isUserOnline(lastSeenAt: string | null): boolean {
    if (!lastSeenAt) return false

    const lastSeen = new Date(lastSeenAt)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)

    return diffMinutes < 5 // Consider online if seen within 5 minutes
  }

  /**
   * Gets online member count for a room
   */
  static async getOnlineMemberCount(roomId: string): Promise<number> {
    const supabase = await createClient()

    const { data: members, error } = await supabase
      .from('room_members')
      .select('last_seen_at')
      .eq('room_id', roomId)

    if (error) {
      throw new Error(`Failed to fetch members: ${error.message}`)
    }

    return (members || []).filter((m) => this.isUserOnline(m.last_seen_at))
      .length
  }
}
