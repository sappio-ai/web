import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionService } from '@/lib/services/SubscriptionService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('id, email').eq('auth_user_id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { plan, billingCycle } = await request.json()
    if (!['student_pro', 'pro_plus'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    if (!['monthly', 'semester'].includes(billingCycle)) return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    if (plan === 'pro_plus' && billingCycle === 'semester') return NextResponse.json({ error: 'Semester billing not available for Pro Plus' }, { status: 400 })

    const { url } = await SubscriptionService.createCheckout(profile.id, profile.email, plan, billingCycle)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error creating subscription checkout:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
