/**
 * Admin Authorization Utilities
 * 
 * Functions for checking admin privileges
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return false
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()
    
    if (profileError || !profile) {
      return false
    }
    
    return profile.role === 'admin'
  } catch (error) {
    console.error('[Admin] Error checking admin status:', error)
    return false
  }
}

/**
 * Get current user's role
 */
export async function getUserRole(): Promise<'user' | 'admin' | null> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()
    
    if (profileError || !profile) {
      return null
    }
    
    return profile.role as 'user' | 'admin'
  } catch (error) {
    console.error('[Admin] Error getting user role:', error)
    return null
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const adminStatus = await isAdmin()
  
  if (!adminStatus) {
    throw new Error('Unauthorized: Admin access required')
  }
}
