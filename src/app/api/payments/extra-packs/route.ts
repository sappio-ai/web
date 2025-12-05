/**
 * POST /api/payments/extra-packs - Create Stripe checkout session for extra packs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExtraPacksService } from '@/lib/services/ExtraPacksService'
import { StripeService } from '@/lib/services/StripeService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to get internal user ID
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { quantity } = body

    // Validate quantity
    if (!quantity || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Get available bundles and validate
    const bundles = ExtraPacksService.getBundles()
    const selectedBundle = bundles.find((b) => b.quantity === quantity)

    if (!selectedBundle) {
      return NextResponse.json(
        { error: 'Invalid bundle selection. Must be 10, 30, or 75 packs' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await StripeService.createExtraPacksCheckout(
      profile.id,
      selectedBundle.quantity,
      selectedBundle.price,
      profile.email
    )

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating extra packs checkout:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
