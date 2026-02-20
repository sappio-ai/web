import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PushService } from '@/lib/services/PushService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const subscription = await request.json()
    await PushService.subscribe(profile.id, subscription)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
