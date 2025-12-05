import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { WaitlistService } from '@/lib/services/WaitlistService'

/**
 * GET /api/admin/waitlist
 * Fetch all waitlist entries (admin only)
 */
export async function GET() {
  try {
    // Check admin authorization
    await requireAdmin()
    
    // Fetch all waitlist entries
    const entries = await WaitlistService.getAllEntries()
    
    return NextResponse.json({
      success: true,
      entries
    })
  } catch (error) {
    console.error('[API] Error fetching waitlist:', error)
    
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
