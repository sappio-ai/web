import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BenefitService } from '@/lib/services/BenefitService'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user profile to find user ID
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }
    
    // Check trial status
    const isInTrial = await BenefitService.isInTrial(profile.id)
    
    if (!isInTrial) {
      return NextResponse.json({
        inTrial: false,
        trialInfo: null
      })
    }
    
    // Get trial details
    const trialInfo = await BenefitService.getTrialInfo(profile.id)
    const daysRemaining = await BenefitService.getTrialDaysRemaining(profile.id)
    
    return NextResponse.json({
      inTrial: true,
      trialInfo,
      daysRemaining
    })
  } catch (error) {
    console.error('[API] Error fetching trial status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
