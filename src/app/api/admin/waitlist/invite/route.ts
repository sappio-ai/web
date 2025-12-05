import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { WaitlistService } from '@/lib/services/WaitlistService'

/**
 * POST /api/admin/waitlist/invite
 * Mark waitlist entries as invited (admin only)
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
    
    // Mark entries as invited
    await WaitlistService.markAsInvited(emails)
    
    return NextResponse.json({
      success: true,
      message: `Marked ${emails.length} entries as invited`
    })
  } catch (error) {
    console.error('[API] Error marking invites:', error)
    
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
