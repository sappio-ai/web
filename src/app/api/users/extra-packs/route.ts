/**
 * GET /api/users/extra-packs - Get user's extra packs balance and expiration info
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExtraPacksService } from '@/lib/services/ExtraPacksService'
import { UsageService } from '@/lib/services/UsageService'

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

    // Get extra packs balance
    const balance = await ExtraPacksService.getAvailableBalance(profile.id)

    // Get expiration warning
    const warning = await UsageService.getExpirationWarning(profile.id)

    return NextResponse.json({
      success: true,
      balance: {
        total: balance.total,
        nearestExpiration: balance.nearestExpiration,
        purchases: balance.purchases.map((p) => ({
          id: p.id,
          quantity: p.quantity,
          consumed: p.consumed,
          available: p.quantity - p.consumed,
          purchasedAt: p.purchasedAt,
          expiresAt: p.expiresAt,
          amountPaid: p.amountPaid,
          currency: p.currency,
        })),
      },
      warning: warning.hasWarning
        ? {
            count: warning.count,
            expiresAt: warning.expiresAt,
            daysRemaining: warning.daysRemaining,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching extra packs balance:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch balance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
