import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { AppSettingsService } from '@/lib/services/AppSettingsService'
import { getUser } from '@/lib/auth/session'

/**
 * GET /api/admin/settings/waitlist-mode
 * Get waitlist mode status
 */
export async function GET() {
  try {
    await requireAdmin()
    
    const status = await AppSettingsService.getWaitlistModeStatus()
    
    return NextResponse.json({
      success: true,
      ...status
    })
  } catch (error) {
    console.error('[API] Error fetching waitlist mode:', error)
    
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

/**
 * POST /api/admin/settings/waitlist-mode
 * Toggle waitlist mode on/off
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { enabled } = body
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: enabled must be a boolean' },
        { status: 400 }
      )
    }
    
    const user = await getUser()
    await AppSettingsService.setWaitlistMode(enabled, user?.id)
    
    return NextResponse.json({
      success: true,
      enabled
    })
  } catch (error) {
    console.error('[API] Error toggling waitlist mode:', error)
    
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
