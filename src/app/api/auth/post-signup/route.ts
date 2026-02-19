import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WaitlistService } from '@/lib/services/WaitlistService'
import { BenefitService } from '@/lib/services/BenefitService'
import { sendWelcomeEmail } from '@/lib/email/send'

/**
 * POST /api/auth/post-signup
 * Handle post-signup operations (waitlist benefits, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, timezone } = body

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or email' },
        { status: 400 }
      )
    }

    console.log(`[PostSignup] Processing post-signup for ${email}`)

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email).catch((err) => {
      console.error('[PostSignup] Failed to send welcome email:', err)
    })

    const supabase = await createClient()

    // Wait for DB trigger to create the user profile
    await new Promise(resolve => setTimeout(resolve, 500))

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .single()

    if (profile) {
      // Update timezone if provided (auto-detected from browser)
      if (timezone) {
        await supabase
          .from('users')
          .update({ timezone })
          .eq('id', profile.id)
      }
    }

    // Check if user is on waitlist and apply benefits
    try {
      const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)

      if (waitlistEntry) {
        console.log(`[PostSignup] User ${email} found on waitlist, applying benefits`)

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

    // Fire onboarding drip email events
    try {
      const { inngest } = await import('@/lib/inngest/client')
      const userName = undefined // Name not available at signup time for email users
      const dripEvents = [
        { name: 'email/onboarding-drip' as const, data: { userId, email, name: userName, day: 2 }, ts: Math.floor(Date.now() / 1000) + 2 * 86400 },
        { name: 'email/onboarding-drip' as const, data: { userId, email, name: userName, day: 3 }, ts: Math.floor(Date.now() / 1000) + 3 * 86400 },
        { name: 'email/onboarding-drip' as const, data: { userId, email, name: userName, day: 5 }, ts: Math.floor(Date.now() / 1000) + 5 * 86400 },
        { name: 'email/onboarding-drip' as const, data: { userId, email, name: userName, day: 7 }, ts: Math.floor(Date.now() / 1000) + 7 * 86400 },
      ]
      await inngest.send(dripEvents)
      console.log(`[PostSignup] Scheduled ${dripEvents.length} onboarding drip emails for ${email}`)
    } catch (dripError) {
      console.error('[PostSignup] Error scheduling drip emails:', dripError)
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
