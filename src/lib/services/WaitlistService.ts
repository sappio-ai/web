/**
 * WaitlistService
 * 
 * Handles waitlist operations including checking membership,
 * marking conversions, and admin management functions.
 */

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export interface WaitlistEntry {
  id: string
  email: string
  studying: string | null
  current_tool: string | null
  wants_early_access: boolean
  referral_code: string
  referred_by: string | null
  created_at: string
  meta_json: {
    invited_at?: string
    invite_sent_at?: string
    converted_at?: string
    invite_status?: 'pending' | 'invited' | 'converted' | 'failed'
  }
}

export class WaitlistService {
  /**
   * Check if an email exists in the waitlist
   * Returns the waitlist entry if found, null otherwise
   */
  static async checkWaitlistMembership(email: string): Promise<WaitlistEntry | null> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .ilike('email', email) // Case-insensitive match
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - not on waitlist
          return null
        }
        throw error
      }

      return data as WaitlistEntry
    } catch (error) {
      console.error('[WaitlistService] Error checking membership:', error)
      return null
    }
  }

  /**
   * Mark a waitlist entry as converted (user created account)
   */
  static async markAsConverted(email: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      const now = new Date().toISOString()
      
      // First, get the existing entry to preserve meta_json data
      const { data: existing, error: fetchError } = await supabase
        .from('waitlist')
        .select('meta_json')
        .ilike('email', email)
        .single()
      
      if (fetchError) {
        console.error('[WaitlistService] Error fetching entry for conversion:', fetchError)
        throw fetchError
      }
      
      // Merge with existing meta_json to preserve invited_at, etc.
      const updatedMetaJson = {
        ...(existing?.meta_json || {}),
        converted_at: now,
        invite_status: 'converted'
      }
      
      const { error } = await supabase
        .from('waitlist')
        .update({
          meta_json: updatedMetaJson
        })
        .ilike('email', email)

      if (error) {
        console.error('[WaitlistService] Error marking as converted:', error)
        throw error
      }
      
      console.log(`[WaitlistService] Marked ${email} as converted`)
    } catch (error) {
      console.error('[WaitlistService] Failed to mark as converted:', error)
      // Don't throw - this is not critical, user still gets benefits
    }
  }

  /**
   * Get all waitlist entries (admin only)
   */
  static async getAllEntries(): Promise<WaitlistEntry[]> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as WaitlistEntry[]
    } catch (error) {
      console.error('[WaitlistService] Error fetching entries:', error)
      throw error
    }
  }

  /**
   * Generate a unique invite code
   */
  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
    let code = 'INV-'
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Mark multiple entries as invited and generate invite codes
   */
  static async markAsInvited(emails: string[]): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      const now = new Date().toISOString()
      
      // Generate unique invite codes for each email
      for (const email of emails) {
        let inviteCode = this.generateInviteCode()
        let attempts = 0
        const maxAttempts = 5
        
        // Ensure code is unique
        while (attempts < maxAttempts) {
          const { data: existing } = await supabase
            .from('waitlist')
            .select('invite_code')
            .eq('invite_code', inviteCode)
            .single()
          
          if (!existing) break
          
          inviteCode = this.generateInviteCode()
          attempts++
        }
        
        // Get existing meta_json to preserve any existing data
        const { data: entry } = await supabase
          .from('waitlist')
          .select('meta_json')
          .ilike('email', email)
          .single()
        
        // Merge with existing meta_json
        const updatedMetaJson = {
          ...(entry?.meta_json || {}),
          invited_at: now,
          invite_status: 'invited'
        }
        
        const { error } = await supabase
          .from('waitlist')
          .update({
            invite_code: inviteCode,
            meta_json: updatedMetaJson
          })
          .ilike('email', email)
        
        if (error) {
          console.error(`[WaitlistService] Error marking ${email} as invited:`, error)
        }
      }
    } catch (error) {
      console.error('[WaitlistService] Error marking as invited:', error)
      throw error
    }
  }

  /**
   * Validate an invite code and return the associated email
   */
  static async validateInviteCode(code: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('waitlist')
        .select('email, meta_json')
        .eq('invite_code', code)
        .single()
      
      if (error || !data) {
        return { valid: false }
      }
      
      // Check if already converted
      if (data.meta_json?.converted_at) {
        return { valid: false } // Code already used
      }
      
      return { valid: true, email: data.email }
    } catch (error) {
      console.error('[WaitlistService] Error validating invite code:', error)
      return { valid: false }
    }
  }

  /**
   * Record email sent timestamp for entries and mark as invited
   */
  static async recordEmailSent(emails: string[]): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      const now = new Date().toISOString()
      
      // Get current meta_json for each entry and update
      const { data: entries, error: fetchError } = await supabase
        .from('waitlist')
        .select('email, meta_json')
        .in('email', emails)

      if (fetchError) throw fetchError

      // Update each entry with email sent timestamp and invited status
      for (const entry of entries || []) {
        const updatedMeta = {
          ...(entry.meta_json || {}),
          invited_at: now,
          invite_sent_at: now,
          invite_status: 'invited'
        }

        const { error: updateError } = await supabase
          .from('waitlist')
          .update({ meta_json: updatedMeta })
          .eq('email', entry.email)

        if (updateError) {
          console.error(`[WaitlistService] Error updating ${entry.email}:`, updateError)
        }
      }
    } catch (error) {
      console.error('[WaitlistService] Error recording email sent:', error)
      throw error
    }
  }

  /**
   * Mark email send as failed for entries
   */
  static async markEmailFailed(emails: string[]): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      // Get current meta_json for each entry and update
      const { data: entries, error: fetchError } = await supabase
        .from('waitlist')
        .select('email, meta_json')
        .in('email', emails)

      if (fetchError) throw fetchError

      // Update each entry with failed status
      for (const entry of entries || []) {
        const updatedMeta = {
          ...(entry.meta_json || {}),
          invite_status: 'failed'
        }

        const { error: updateError } = await supabase
          .from('waitlist')
          .update({ meta_json: updatedMeta })
          .eq('email', entry.email)

        if (updateError) {
          console.error(`[WaitlistService] Error updating ${entry.email}:`, updateError)
        }
      }
    } catch (error) {
      console.error('[WaitlistService] Error marking email failed:', error)
      throw error
    }
  }

  /**
   * Export waitlist to CSV format
   */
  static async exportToCSV(): Promise<string> {
    try {
      const entries = await this.getAllEntries()
      
      // CSV header
      const headers = [
        'Email',
        'Studying',
        'Current Tool',
        'Wants Early Access',
        'Referral Code',
        'Referred By',
        'Created At',
        'Invite Status',
        'Invited At',
        'Converted At'
      ]
      
      // CSV rows
      const rows = entries.map(entry => [
        entry.email,
        entry.studying || '',
        entry.current_tool || '',
        entry.wants_early_access ? 'Yes' : 'No',
        entry.referral_code,
        entry.referred_by || '',
        entry.created_at,
        entry.meta_json?.invite_status || 'pending',
        entry.meta_json?.invited_at || '',
        entry.meta_json?.converted_at || ''
      ])
      
      // Combine into CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      return csvContent
    } catch (error) {
      console.error('[WaitlistService] Error exporting to CSV:', error)
      throw error
    }
  }
}
