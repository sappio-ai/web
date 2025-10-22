import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { UsageService } from '@/lib/services/UsageService'
import { ErrorLogger } from '@/lib/services/ErrorLogger'

/**
 * Test endpoint to verify events table is working
 * GET /api/test-events - Check events table
 * POST /api/test-events - Insert test event
 */

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    console.log('[test-events] Fetching all events')

    // Get all events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[test-events] Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events', details: error },
        { status: 500 }
      )
    }

    console.log('[test-events] Found', events?.length || 0, 'events')

    // Get counts by event type
    const { data: counts } = await supabase
      .from('events')
      .select('event')
      .then((result) => {
        const eventCounts: Record<string, number> = {}
        result.data?.forEach((e) => {
          eventCounts[e.event] = (eventCounts[e.event] || 0) + 1
        })
        return { data: eventCounts }
      })

    return NextResponse.json({
      success: true,
      totalEvents: events?.length || 0,
      events: events || [],
      eventCounts: counts || {},
    })
  } catch (error) {
    console.error('[test-events] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[test-events] Creating test event for user:', user.id)

    // Test 1: Insert using UsageService
    console.log('[test-events] Test 1: UsageService.logUsageEvent')
    await UsageService.logUsageEvent(user.id, 'pack_created', {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'test-endpoint',
    })

    // Test 2: Insert using ErrorLogger
    console.log('[test-events] Test 2: ErrorLogger.logError')
    await ErrorLogger.logError({
      userId: user.id,
      errorType: 'test_error',
      errorCode: 'TEST_ERROR',
      errorMessage: 'This is a test error',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'test-endpoint',
      },
    })

    // Test 3: Direct insert with service role
    console.log('[test-events] Test 3: Direct insert with service role')
    const serviceSupabase = createServiceRoleClient()
    const { data: directInsert, error: directError } = await serviceSupabase
      .from('events')
      .insert({
        user_id: user.id,
        event: 'test_direct_insert',
        props_json: {
          test: true,
          timestamp: new Date().toISOString(),
          source: 'test-endpoint',
          method: 'direct',
        },
      })
      .select()

    if (directError) {
      console.error('[test-events] Direct insert error:', directError)
    } else {
      console.log('[test-events] Direct insert success:', directInsert)
    }

    // Verify events were created
    const { data: verifyEvents, error: verifyError } = await serviceSupabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (verifyError) {
      console.error('[test-events] Verify error:', verifyError)
    } else {
      console.log('[test-events] Found', verifyEvents?.length || 0, 'events for user')
    }

    return NextResponse.json({
      success: true,
      message: 'Test events created',
      userId: user.id,
      eventsCreated: 3,
      recentEvents: verifyEvents || [],
    })
  } catch (error) {
    console.error('[test-events] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
