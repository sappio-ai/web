import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WaitlistService } from '@/lib/services/WaitlistService'
import { BenefitService } from '@/lib/services/BenefitService'

/**
 * POST /api/auth/post-signup
 * Handle post-signup operations (waitlist benefits, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email } = body

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or email' },
        { status: 400 }
      )
    }

    console.log(`[PostSignup] Processing post-signup for ${email}`)

    // Check if user is on waitlist and apply benefits
    try {
      const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)
      
      if (waitlistEntry) {
        console.log(`[PostSignup] User ${email} found on waitlist, applying benefits`)
        
        const supabase = await createClient()
        
        // Get the user profile ID (wait a moment for trigger to complete)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', userId)
          .single()
        
        if (profile) {
          // Apply waitlist benefits
          await BenefitService.applyWaitlistBenefits(profile.id, email)
          
          // Mark waitlist entry as converted
          await WaitlistService.markAsConverted(email)
          
          console.log(`[PostSignup] Benefits applied and marked as converted for ${email}`)
        } else {
          console.error('[PostSignup] User profile not found after signup')
        }
      } else {
        console.log(`[PostSignup] User ${email} not on waitlist, skipping benefits`)
      }
    } catch (benefitError) {
      // Log error but don't fail the request
      console.error('[PostSignup] Error applying waitlist benefits:', benefitError)
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('[PostSignup] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
