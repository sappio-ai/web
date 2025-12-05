import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/admin/test/expire-plans
 * Manually trigger the plan expiration cron job (admin only)
 * Used for testing without waiting for scheduled run
 */
export async function POST() {
  try {
    await requireAdmin()
    
    // Manually trigger the cron job
    const result = await inngest.send({
      name: 'inngest/function.invoked',
      data: {
        function_id: 'expire-plans',
        event: {
          name: 'cron/expire-plans',
          data: { manual: true, triggered_at: new Date().toISOString() },
        },
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Plan expiration job triggered',
      result,
    })
  } catch (error) {
    console.error('[Test] Error triggering expire-plans:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
