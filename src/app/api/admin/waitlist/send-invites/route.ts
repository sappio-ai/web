import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { EmailService } from '@/lib/email/EmailService'
import { WaitlistService } from '@/lib/services/WaitlistService'

/**
 * POST /api/admin/waitlist/send-invites
 * Send invite emails to selected waitlist members (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    await requireAdmin()
    
    const body = await request.json()
    const { emails } = body
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: emails array required' },
        { status: 400 }
      )
    }
    
    // First, mark users as invited (generates invite codes if needed)
    await WaitlistService.markAsInvited(emails)
    
    // Get invite codes for these emails
    const { createServiceRoleClient } = await import('@/lib/supabase/server')
    const supabase = createServiceRoleClient()
    
    const { data: waitlistEntries, error: fetchError } = await supabase
      .from('waitlist')
      .select('email, invite_code')
      .in('email', emails)
    
    if (fetchError || !waitlistEntries) {
      return NextResponse.json(
        { error: 'Failed to fetch invite codes' },
        { status: 500 }
      )
    }
    
    // Prepare emails with codes
    const emailsWithCodes = waitlistEntries
      .filter(entry => entry.invite_code)
      .map(entry => ({
        email: entry.email,
        inviteCode: entry.invite_code!
      }))
    
    if (emailsWithCodes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate invite codes' },
        { status: 500 }
      )
    }
    
    // Send emails
    const { successful, failed } = await EmailService.sendBulkInvites(emailsWithCodes)
    
    // Record successful sends
    if (successful.length > 0) {
      await WaitlistService.recordEmailSent(successful)
    }
    
    // Mark failed sends
    if (failed.length > 0) {
      await WaitlistService.markEmailFailed(failed.map(f => f.email))
    }
    
    return NextResponse.json({
      success: true,
      sent: successful.length,
      failed: failed.length,
      failures: failed
    })
  } catch (error) {
    console.error('[API] Error sending invites:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
