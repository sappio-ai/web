/**
 * GET /api/users/extra-packs/history - Get user's extra packs purchase history
 */

import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
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
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get all purchases (including refunded) using service role
    const serviceSupabase = createServiceRoleClient()
    const { data: purchases, error: purchasesError } = await serviceSupabase
      .from('extra_pack_purchases')
      .select('*')
      .eq('user_id', profile.id)
      .order('purchased_at', { ascending: false })

    if (purchasesError) {
      console.error('Error fetching purchase history:', purchasesError)
      return NextResponse.json(
        { error: 'Failed to fetch purchase history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      purchases: (purchases || []).map((p) => ({
        id: p.id,
        quantity: p.quantity,
        consumed: p.consumed,
        available: p.quantity - p.consumed,
        amountPaid: parseFloat(p.amount_paid),
        currency: p.currency,
        purchasedAt: p.purchased_at,
        expiresAt: p.expires_at,
        status: p.status,
        refundedAt: p.refunded_at,
        refundAmount: p.refund_amount ? parseFloat(p.refund_amount) : null,
      })),
    })
  } catch (error) {
    console.error('Error fetching purchase history:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch purchase history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
