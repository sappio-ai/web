import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { PricingService } from '@/lib/services/PricingService'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser()
    
    // Get user profile ID if authenticated
    let userId: string | null = null
    
    if (user) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      
      userId = profile?.id || null
    }
    
    // Get pricing (with lock if applicable)
    const pricing = await PricingService.getPricingForUser(userId)
    
    return NextResponse.json({
      success: true,
      pricing
    })
  } catch (error) {
    console.error('[Pricing API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}
