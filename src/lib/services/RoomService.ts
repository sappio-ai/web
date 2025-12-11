/**
 * RoomService - Handles CRUD operations for study rooms
 * Implements room creation, management, membership, and access control
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type {
  Room,
  RoomMemberWithUser,
  CreateRoomInput,
  UpdateRoomInput,
  RoomListItem,
  RoomWithMembers,
} from '@/lib/types/rooms'
import type { TablesInsert, TablesUpdate } from '@/lib/types/database'

export class RoomService {
  /**
   * Creates a new room with the creator as the first member
   * Generates a unique invite code for the room
   */
  static async createRoom(
    userId: string,
    input: CreateRoomInput
  ): Promise<Room> {
    const supabase = await createClient()

    // Validate room name
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Room name cannot be empty')
    }

    // Generate unique invite code
    const inviteCode = this.generateInviteCode()

    // Create room record
    const roomData: TablesInsert<'study_rooms'> = {
      creator_id: userId,
      name: input.name.trim(),
      background_theme: input.backgroundTheme || 'forest',
      privacy: input.privacy || 'private',
      pomodoro_work_minutes: input.pomodoroWorkMinutes || 25,
      pomodoro_break_minutes: input.pomodoroBreakMinutes || 5,
      status: 'active',
      last_activity_at: new Date().toISOString(),
      meta_json: { invite_code: inviteCode },
    }

    const { data: room, error: roomError } = await supabase
      .from('study_rooms')
      .insert(roomData)
      .select()
      .single()

    if (roomError || !room) {
      throw new Error(`Failed to create room: ${roomError?.message}`)
    }

    // Add creator as first member with creator role
    const memberData: TablesInsert<'room_members'> = {
      room_id: room.id,
      user_id: userId,
      role: 'creator',
      joined_at: new Date().toISOString(),
    }

    const { error: memberError } = await supabase
      .from('room_members')
      .insert(memberData)

    if (memberError) {
      // Rollback room creation if member insertion fails
      await supabase.from('study_rooms').delete().eq('id', room.id)
      throw new Error(`Failed to add creator as member: ${memberError.message}`)
    }

    return this.mapRowToRoom(room)
  }

  /**
   * Gets a room by ID with member count
   * Uses service role to bypass RLS for cross-table queries
   */
  static async getRoom(roomId: string, userId?: string): Promise<Room> {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    console.log('[RoomService.getRoom] Fetching room:', { roomId, userId })

    const { data: room, error } = await supabase
      .from('study_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('status', 'active')
      .single()

    if (error || !room) {
      console.error('[RoomService.getRoom] Room not found:', { roomId, error: error?.message })
      throw new Error('Room not found')
    }

    console.log('[RoomService.getRoom] Room found:', { roomId, roomName: room.name })

    // If userId provided, verify membership
    if (userId) {
      console.log('[RoomService.getRoom] Checking membership:', { roomId, userId })
      
      const { data: member, error: memberError } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single()

      console.log('[RoomService.getRoom] Membership check result:', { 
        roomId, 
        userId, 
        found: !!member,
        error: memberError?.message 
      })

      if (!member) {
        throw new Error('User is not a member of this room')
      }
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)

    const mappedRoom = this.mapRowToRoom(room)
    mappedRoom.memberCount = memberCount || 0

    return mappedRoom
  }

  /**
   * Gets a room with full member details
   * Uses service role to bypass RLS for cross-table queries
   */
  static async getRoomWithMembers(
    roomId: string,
    userId: string
  ): Promise<RoomWithMembers> {
    const supabase = createServiceRoleClient()

    // Get room
    const room = await this.getRoom(roomId, userId)

    // Get members with user details
    const { data: members, error: membersError } = await supabase
      .from('room_members')
      .select(
        `
        *,
        user:users!room_members_user_id_fkey (
          id,
          full_name,
          avatar_url,
          email
        )
      `
      )
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      throw new Error(`Failed to fetch members: ${membersError.message}`)
    }

    // Get creator details
    const { data: creator, error: creatorError } = await supabase
      .from('users')
      .select('full_name, avatar_url')
      .eq('id', room.creatorId)
      .single()

    if (creatorError) {
      throw new Error(`Failed to fetch creator: ${creatorError.message}`)
    }

    return {
      ...room,
      members: (members || [])
        .filter((m: any) => {
          if (!m.user) {
            console.error('[RoomService.getRoomWithMembers] Member has no user:', m)
            return false
          }
          return true
        })
        .map((m: any) => ({
          id: m.id,
          room_id: m.room_id,
          user_id: m.user_id,
          role: m.role,
          joined_at: m.joined_at,
          last_seen_at: m.last_seen_at,
          user: {
            id: m.user.id,
            fullName: m.user.full_name,
            avatarUrl: m.user.avatar_url,
            email: m.user.email,
          },
        })),
      creator: {
        fullName: creator.full_name,
        avatarUrl: creator.avatar_url,
      },
    }
  }

  /**
   * Gets all rooms a user is a member of
   * Uses service role to bypass RLS for cross-table queries
   */
  static async getUserRooms(userId: string): Promise<RoomListItem[]> {
    const supabase = createServiceRoleClient()

    // Get rooms where user is a member
    const { data: memberships, error: memberError } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', userId)

    if (memberError) {
      throw new Error(`Failed to fetch user rooms: ${memberError.message}`)
    }

    if (!memberships || memberships.length === 0) {
      return []
    }

    const roomIds = memberships.map((m) => m.room_id)

    // Get room details
    const { data: rooms, error: roomsError } = await supabase
      .from('study_rooms')
      .select('*')
      .in('id', roomIds)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })

    if (roomsError) {
      throw new Error(`Failed to fetch rooms: ${roomsError.message}`)
    }

    // Get member counts for each room
    const roomsWithCounts = await Promise.all(
      (rooms || []).map(async (room) => {
        const { count: memberCount } = await supabase
          .from('room_members')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)

        return {
          id: room.id,
          name: room.name,
          backgroundTheme: room.background_theme,
          memberCount: memberCount || 0,
          onlineCount: 0, // Will be populated by presence service
          lastActivityAt: room.last_activity_at,
          createdAt: room.created_at,
          isCreator: room.creator_id === userId,
        } as RoomListItem
      })
    )

    return roomsWithCounts
  }

  /**
   * Updates room settings (creator only)
   */
  static async updateRoom(
    roomId: string,
    userId: string,
    input: UpdateRoomInput
  ): Promise<Room> {
    const supabase = await createClient()

    // Verify user is the creator
    const { data: room } = await supabase
      .from('study_rooms')
      .select('creator_id')
      .eq('id', roomId)
      .single()

    if (!room || room.creator_id !== userId) {
      throw new Error('Only the room creator can update settings')
    }

    // Build update data
    const updateData: TablesUpdate<'study_rooms'> = {
      updated_at: new Date().toISOString(),
    }

    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new Error('Room name cannot be empty')
      }
      updateData.name = input.name.trim()
    }

    if (input.backgroundTheme !== undefined) {
      updateData.background_theme = input.backgroundTheme
    }

    if (input.privacy !== undefined) {
      updateData.privacy = input.privacy
    }

    if (input.pomodoroWorkMinutes !== undefined) {
      updateData.pomodoro_work_minutes = input.pomodoroWorkMinutes
    }

    if (input.pomodoroBreakMinutes !== undefined) {
      updateData.pomodoro_break_minutes = input.pomodoroBreakMinutes
    }

    const { data: updatedRoom, error } = await supabase
      .from('study_rooms')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single()

    if (error || !updatedRoom) {
      throw new Error(`Failed to update room: ${error?.message}`)
    }

    return this.mapRowToRoom(updatedRoom)
  }

  /**
   * Deletes a room and all associated data (creator only)
   */
  static async deleteRoom(roomId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    // Verify user is the creator
    const { data: room } = await supabase
      .from('study_rooms')
      .select('creator_id')
      .eq('id', roomId)
      .single()

    if (!room || room.creator_id !== userId) {
      throw new Error('Only the room creator can delete the room')
    }

    // Soft delete by setting status to 'deleted'
    const { error } = await supabase
      .from('study_rooms')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', roomId)

    if (error) {
      throw new Error(`Failed to delete room: ${error.message}`)
    }
  }

  /**
   * Adds a user to a room
   */
  static async joinRoom(roomId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    // Check if room exists and is active
    const { data: room } = await supabase
      .from('study_rooms')
      .select('id, status')
      .eq('id', roomId)
      .eq('status', 'active')
      .single()

    if (!room) {
      throw new Error('Room not found or inactive')
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      return // Already a member, no-op
    }

    // Add user as member
    const memberData: TablesInsert<'room_members'> = {
      room_id: roomId,
      user_id: userId,
      role: 'member',
      joined_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('room_members').insert(memberData)

    if (error) {
      throw new Error(`Failed to join room: ${error.message}`)
    }

    // Update room last activity
    await supabase
      .from('study_rooms')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', roomId)
  }

  /**
   * Removes a user from a room
   */
  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    // Check if user is the creator
    const { data: room } = await supabase
      .from('study_rooms')
      .select('creator_id')
      .eq('id', roomId)
      .single()

    if (room?.creator_id === userId) {
      throw new Error('Room creator cannot leave. Delete the room instead.')
    }

    // Remove member
    const { error } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to leave room: ${error.message}`)
    }
  }

  /**
   * Removes a member from a room (creator only)
   */
  static async removeMember(
    roomId: string,
    creatorId: string,
    memberUserId: string
  ): Promise<void> {
    const supabase = await createClient()

    // Verify user is the creator
    const { data: room } = await supabase
      .from('study_rooms')
      .select('creator_id')
      .eq('id', roomId)
      .single()

    if (!room || room.creator_id !== creatorId) {
      throw new Error('Only the room creator can remove members')
    }

    // Cannot remove self
    if (creatorId === memberUserId) {
      throw new Error('Cannot remove yourself. Delete the room instead.')
    }

    // Remove member
    const { error } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', memberUserId)

    if (error) {
      throw new Error(`Failed to remove member: ${error.message}`)
    }
  }

  /**
   * Generates a unique invite code for a room
   */
  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Maps a database row to a Room interface
   */
  private static mapRowToRoom(row: any): Room {
    return {
      id: row.id,
      name: row.name,
      creatorId: row.creator_id,
      backgroundTheme: row.background_theme,
      privacy: row.privacy,
      pomodoroWorkMinutes: row.pomodoro_work_minutes,
      pomodoroBreakMinutes: row.pomodoro_break_minutes,
      status: row.status,
      lastActivityAt: row.last_activity_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metaJson: row.meta_json || {},
    }
  }
}
