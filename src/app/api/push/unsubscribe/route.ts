import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { endpoint } = await request.json()
    const adminSupabase = createServiceRoleClient()
    await adminSupabase.from('push_subscriptions').delete().eq('user_id', profile.id).eq('endpoint', endpoint)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unsubscribing from push:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
