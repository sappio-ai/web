/**
 * InviteService - Handles room invitations and invite management
 * Implements invite creation, acceptance, and real-time notifications
 */

import { createClient } from '@/lib/supabase/server'
import type { RoomInviteWithDetails } from '@/lib/types/rooms'
import type { TablesInsert } from '@/lib/types/database'
import crypto from 'crypto'

export class InviteService {
  /**
   * Creates an invite for a room
   */
  static async createInvite(
    roomId: string,
    inviterId: string,
    inviteeEmail: string
  ): Promise<RoomInviteWithDetails> {
    const supabase = await createClient()

    // Verify inviter is a member of the room
    const { data: member } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', inviterId)
      .single()

    if (!member) {
      throw new Error('User is not a member of this room')
    }

    // Check if invitee is already a member
    const { data: existingMember } = await supabase
      .from('room_members')
      .select('id, user:users!room_members_user_id_fkey(email)')
      .eq('room_id', roomId)

    const isMember = existingMember?.some(
      (m: any) => m.user?.email === inviteeEmail
    )

    if (isMember) {
      throw new Error('User is already a member of this room')
    }

    // Check for existing pending invite
    const { data: existingInvite } = await supabase
      .from('room_invites')
      .select('id')
      .eq('room_id', roomId)
      .eq('invitee_email', inviteeEmail)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      throw new Error('An invite has already been sent to this email')
    }

    // Look up invitee user ID if they exist
    const { data: inviteeUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', inviteeEmail)
      .single()

    // Generate unique invite token
    const inviteToken = this.generateInviteToken()

    // Create invite record
    const inviteData: TablesInsert<'room_invites'> = {
      room_id: roomId,
      inviter_id: inviterId,
      invitee_email: inviteeEmail,
      invitee_user_id: inviteeUser?.id || null,
      status: 'pending',
      invite_token: inviteToken,
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    const { data: invite, error } = await supabase
      .from('room_invites')
      .insert(inviteData)
      .select(
        `
        *,
        room:study_rooms!room_invites_room_id_fkey (
          name,
          background_theme
        ),
        inviter:users!room_invites_inviter_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .single()

    if (error || !invite) {
      throw new Error(`Failed to create invite: ${error?.message}`)
    }

    return this.mapRowToInvite(invite)
  }

  /**
   * Gets an invite by token
   */
  static async getInviteByToken(token: string): Promise<RoomInviteWithDetails> {
    const supabase = await createClient()

    const { data: invite, error } = await supabase
      .from('room_invites')
      .select(
        `
        *,
        room:study_rooms!room_invites_room_id_fkey (
          name,
          background_theme
        ),
        inviter:users!room_invites_inviter_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .eq('invite_token', token)
      .single()

    if (error || !invite) {
      throw new Error('Invite not found')
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('room_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id)

      throw new Error('Invite has expired')
    }

    return this.mapRowToInvite(invite)
  }

  /**
   * Accepts an invite and adds user to room
   */
  static async acceptInvite(
    inviteToken: string,
    userId: string
  ): Promise<{ roomId: string }> {
    const supabase = await createClient()

    // Get invite
    const invite = await this.getInviteByToken(inviteToken)

    // Verify invite is for this user
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!user || user.email !== invite.invitee_email) {
      throw new Error('This invite is not for you')
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', invite.room_id)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      // Already a member, just mark invite as accepted
      await supabase
        .from('room_invites')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
        })
        .eq('invite_token', inviteToken)

      return { roomId: invite.room_id }
    }

    // Add user to room
    const memberData: TablesInsert<'room_members'> = {
      room_id: invite.room_id,
      user_id: userId,
      role: 'member',
      joined_at: new Date().toISOString(),
    }

    const { error: memberError } = await supabase
      .from('room_members')
      .insert(memberData)

    if (memberError) {
      throw new Error(`Failed to join room: ${memberError.message}`)
    }

    // Mark invite as accepted
    await supabase
      .from('room_invites')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
      })
      .eq('invite_token', inviteToken)

    // Update room last activity
    await supabase
      .from('study_rooms')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', invite.room_id)

    return { roomId: invite.room_id }
  }

  /**
   * Declines an invite
   */
  static async declineInvite(
    inviteToken: string,
    userId: string
  ): Promise<void> {
    const supabase = await createClient()

    // Get invite
    const invite = await this.getInviteByToken(inviteToken)

    // Verify invite is for this user
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!user || user.email !== invite.invitee_email) {
      throw new Error('This invite is not for you')
    }

    // Mark invite as declined
    const { error } = await supabase
      .from('room_invites')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString(),
      })
      .eq('invite_token', inviteToken)

    if (error) {
      throw new Error(`Failed to decline invite: ${error.message}`)
    }
  }

  /**
   * Gets pending invites for a user
   */
  static async getPendingInvites(
    userId: string
  ): Promise<RoomInviteWithDetails[]> {
    const supabase = await createClient()

    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    // Get pending invites
    const { data: invites, error } = await supabase
      .from('room_invites')
      .select(
        `
        *,
        room:study_rooms!room_invites_room_id_fkey (
          name,
          background_theme
        ),
        inviter:users!room_invites_inviter_id_fkey (
          full_name,
          avatar_url
        )
      `
      )
      .eq('invitee_email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('sent_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch invites: ${error.message}`)
    }

    return (invites || []).map(this.mapRowToInvite)
  }

  /**
   * Returns subscription configuration for real-time invite notifications
   */
  static getSubscriptionConfig(userId: string) {
    return {
      channel: `user:${userId}:invites`,
      table: 'room_invites',
      filter: `invitee_user_id=eq.${userId}`,
      event: 'INSERT',
    }
  }

  /**
   * Generates a unique invite token
   */
  private static generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Maps a database row to RoomInviteWithDetails
   */
  private static mapRowToInvite(row: any): RoomInviteWithDetails {
    return {
      id: row.id,
      room_id: row.room_id,
      inviter_id: row.inviter_id,
      invitee_email: row.invitee_email,
      invitee_user_id: row.invitee_user_id,
      status: row.status,
      invite_token: row.invite_token,
      sent_at: row.sent_at,
      responded_at: row.responded_at,
      expires_at: row.expires_at,
      room: row.room
        ? {
            name: row.room.name,
            backgroundTheme: row.room.background_theme,
          }
        : undefined,
      inviter: row.inviter
        ? {
            fullName: row.inviter.full_name,
            avatarUrl: row.inviter.avatar_url,
          }
        : undefined,
    }
  }
}
