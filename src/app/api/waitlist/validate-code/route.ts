import { NextRequest, NextResponse } from 'next/server'
import { WaitlistService } from '@/lib/services/WaitlistService'
import { AppSettingsService } from '@/lib/services/AppSettingsService'

/**
 * POST /api/waitlist/validate-code
 * Validate an invite code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body
    
    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      )
    }
    
    // Validate the code
    const { valid, email } = await WaitlistService.validateInviteCode(code)
    
    if (!valid) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or already used invite code' },
        { status: 200 }
      )
    }
    
    return NextResponse.json({
      valid: true,
      email
    })
  } catch (error) {
    console.error('[API] Error validating invite code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/waitlist/validate-code
 * Check if waitlist mode is enabled
 */
export async function GET() {
  try {
    const enabled = await AppSettingsService.isWaitlistModeEnabled()
    
    return NextResponse.json({
      waitlistModeEnabled: enabled
    })
  } catch (error) {
    console.error('[API] Error checking waitlist mode:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
