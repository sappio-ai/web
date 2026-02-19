import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { XPService } from '@/lib/services/XPService'
import { BADGES } from '@/lib/constants/badges'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const earnedBadges = await XPService.getUserBadges(profile.id)

    return NextResponse.json({
      success: true,
      badges: BADGES,
      earned: earnedBadges,
    })
  } catch (error) {
    console.error('Badges fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
