import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function generateResetToken(userId: string): Promise<string> {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Hash the token for storage
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  
  // Store in database with 1 hour expiration
  // Use service role client to bypass RLS
  const supabase = createServiceRoleClient()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
  
  const { error } = await supabase
    .from('password_reset_tokens')
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    })
  
  if (error) {
    console.error('Failed to insert reset token:', error)
    throw new Error(`Failed to create reset token: ${error.message}`)
  }
  
  return token
}

export async function validateResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  // Hash the provided token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  
  // Use service role client to bypass RLS
  const supabase = createServiceRoleClient()
  
  // Find the token in database
  const { data: resetToken, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .single()
  
  if (error || !resetToken) {
    return { valid: false, error: 'Invalid or expired reset token' }
  }
  
  // Check if already used
  if (resetToken.used_at) {
    return { valid: false, error: 'This reset link has already been used' }
  }
  
  // Check if expired
  if (new Date(resetToken.expires_at) < new Date()) {
    return { valid: false, error: 'This reset link has expired' }
  }
  
  return { valid: true, userId: resetToken.user_id }
}

export async function markTokenAsUsed(token: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  
  // Use service role client to bypass RLS
  const supabase = createServiceRoleClient()
  
  await supabase
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
}
