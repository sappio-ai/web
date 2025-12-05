/**
 * AppSettingsService
 * 
 * Manages global application settings stored in database
 */

import { createBrowserClient } from '@/lib/supabase/client'
import { createServiceRoleClient } from '@/lib/supabase/server'

export class AppSettingsService {
  /**
   * Check if waitlist mode is enabled (works on both client and server)
   */
  static async isWaitlistModeEnabled(): Promise<boolean> {
    try {
      // Try to use service role client first (server-side), fall back to browser client
      let supabase
      try {
        supabase = createServiceRoleClient()
      } catch {
        supabase = createBrowserClient()
      }
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'waitlist_mode')
        .single()
      
      if (error) {
        // If no row exists, default to enabled
        if (error.code === 'PGRST116') {
          return true
        }
        console.error('[AppSettingsService] Error fetching waitlist mode:', error)
        return true
      }
      
      return data?.value?.enabled ?? true
    } catch (error) {
      console.error('[AppSettingsService] Failed to check waitlist mode:', error)
      return true
    }
  }

  /**
   * Toggle waitlist mode on/off (server-side only)
   */
  static async setWaitlistMode(enabled: boolean, userId?: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      // Use upsert to insert or update
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'waitlist_mode',
          value: { enabled },
          updated_at: new Date().toISOString(),
          updated_by: userId || null
        }, {
          onConflict: 'key'
        })
      
      if (error) {
        console.error('[AppSettingsService] Error updating waitlist mode:', error)
        throw error
      }
      
      console.log(`[AppSettingsService] Waitlist mode set to: ${enabled}`)
    } catch (error) {
      console.error('[AppSettingsService] Failed to set waitlist mode:', error)
      throw error
    }
  }

  /**
   * Get waitlist mode status with metadata (server-side only)
   */
  static async getWaitlistModeStatus(): Promise<{
    enabled: boolean
    updatedAt: string | null
    updatedBy: string | null
  }> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('value, updated_at, updated_by')
        .eq('key', 'waitlist_mode')
        .single()
      
      if (error) {
        // If no row exists, return default
        if (error.code === 'PGRST116') {
          return { enabled: true, updatedAt: null, updatedBy: null }
        }
        console.error('[AppSettingsService] Error fetching waitlist mode status:', error)
        return { enabled: true, updatedAt: null, updatedBy: null }
      }
      
      return {
        enabled: data?.value?.enabled ?? true,
        updatedAt: data?.updated_at || null,
        updatedBy: data?.updated_by || null
      }
    } catch (error) {
      console.error('[AppSettingsService] Failed to get waitlist mode status:', error)
      return { enabled: true, updatedAt: null, updatedBy: null }
    }
  }
}
