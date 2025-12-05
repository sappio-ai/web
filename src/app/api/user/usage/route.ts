/**
 * GET /api/user/usage - Get current user's usage statistics
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    // Get usage stats
    const stats = await UsageService.getUsageStats(profile.id)

    return NextResponse.json({
      success: true,
      currentUsage: stats.currentUsage,
      limit: stats.limit,
      remaining: stats.remaining,
      percentUsed: stats.percentUsed,
      periodStart: stats.periodStart,
      periodEnd: stats.periodEnd,
      isAtLimit: stats.isAtLimit,
      isNearLimit: stats.isNearLimit,
      extraPacksAvailable: stats.extraPacksAvailable,
      totalAvailable: stats.totalAvailable,
    })
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch usage statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
