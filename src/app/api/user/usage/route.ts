import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UsageService } from '@/lib/services/UsageService'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to get plan and database ID
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Failed to fetch user profile:', profileError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get plan limits
    const limits = await UsageService.getPlanLimits(profile.plan)

    // Get usage stats using the database user ID
    const stats = await UsageService.getUsageStats(profile.id)

    // Return flattened response for backward compatibility with components
    // that expect data at the top level
    return NextResponse.json({
      limits,
      stats,
      // Flatten stats to top level for components that expect it
      currentUsage: stats.currentUsage,
      remaining: stats.remaining,
      limit: stats.limit,
      periodStart: stats.periodStart,
      periodEnd: stats.periodEnd,
      percentUsed: stats.percentUsed,
      isAtLimit: stats.isAtLimit,
      isNearLimit: stats.isNearLimit,
      hasGraceWindow: stats.hasGraceWindow,
      extraPacksAvailable: stats.extraPacksAvailable,
      totalAvailable: stats.totalAvailable,
    })
  } catch (error) {
    console.error('Error in user usage endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
