import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { WaitlistService } from '@/lib/services/WaitlistService'

/**
 * GET /api/admin/waitlist/export
 * Export waitlist to CSV (admin only)
 */
export async function GET() {
  try {
    // Check admin authorization
    await requireAdmin()
    
    // Generate CSV
    const csv = await WaitlistService.exportToCSV()
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="waitlist-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('[API] Error exporting waitlist:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
