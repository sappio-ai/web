import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * POST /api/email/unsubscribe
 * Unsubscribes a user from email reminders using a signed token.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const userId = verifyUnsubscribeToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { error } = await supabase
      .from('users')
      .update({ email_reminders: false })
      .eq('id', userId)

    if (error) {
      console.error('[unsubscribe] DB error:', error)
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[unsubscribe] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
