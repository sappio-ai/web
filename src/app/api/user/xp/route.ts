import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { XPService } from '@/lib/services/XPService'

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

    const [xp, dailyProgress] = await Promise.all([
      XPService.getXP(profile.id),
      XPService.getDailyProgress(profile.id),
    ])

    return NextResponse.json({
      success: true,
      xp,
      dailyProgress,
    })
  } catch (error) {
    console.error('XP fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
