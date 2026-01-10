import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PostHogClient from '@/lib/posthog'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { event, props } = body

    if (!event || typeof event !== 'string') {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      )
    }

    // Get user from database
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Insert event into DB
    const { error: insertError } = await supabase.from('events').insert({
      user_id: dbUser.id,
      event,
      props_json: props || {},
    })

    if (insertError) {
      console.error('Error inserting event:', insertError)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    // Send to PostHog
    try {
      const posthog = PostHogClient()
      if (posthog) {
        posthog.capture({
          distinctId: dbUser.id, // Use internal DB ID for consistent tracking
          event: event,
          properties: {
            ...props,
            $set: { email: user.email } // Ensure user properties are updated
          }
        })
        await posthog.shutdown() // Ensure flush
      }
    } catch (phError) {
      console.error('PostHog tracking failed:', phError)
      // Non-blocking - don't fail the request
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
