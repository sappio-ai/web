import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { inngest } from '@/lib/inngest/client'

/**
 * Test endpoint to manually trigger the expire-extra-packs cron job
 * Only accessible by admins
 */
export async function POST() {
  try {
    // Require admin authentication
    await requireAdmin()
    
    // Manually trigger the cron job
    const result = await inngest.send({
      name: 'inngest/function.invoked',
      data: {
        function_id: 'expire-extra-packs',
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Expire extra packs job triggered successfully',
      result,
    })
  } catch (error) {
    console.error('Error triggering expire-extra-packs job:', error)
    return NextResponse.json(
      { error: 'Failed to trigger job' },
      { status: 500 }
    )
  }
}
