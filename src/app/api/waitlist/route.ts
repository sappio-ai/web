import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'

// Generate a simple referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, studying, currentTool, wantsEarlyAccess, referredBy } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasSupabase = supabaseUrl && supabaseServiceKey

    if (hasSupabase) {
      // Use Supabase with service role to bypass RLS
      const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      const referralCode = generateReferralCode()
      
      const { data, error } = await supabase
        .from('waitlist')
        .insert({
          email,
          studying: studying || null,
          current_tool: currentTool || null,
          wants_early_access: wantsEarlyAccess !== undefined ? wantsEarlyAccess : true,
          referral_code: referralCode,
          referred_by: referredBy || null,
          meta_json: {}
        })
        .select()
        .single()

      if (error) {
        // Check for duplicate email
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'This email is already on the waitlist' },
            { status: 409 }
          )
        }
        
        console.error('Supabase error:', error)
        return NextResponse.json(
          { error: 'Failed to join waitlist', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        referralCode: data.referral_code
      })
    } else {
      // Fallback: In-memory store (for development)
      console.log('Waitlist signup (in-memory):', { email, studying, currentTool, wantsEarlyAccess, referredBy })
      
      const referralCode = generateReferralCode()
      
      return NextResponse.json({
        success: true,
        referralCode,
        note: 'Using in-memory store. Configure Supabase for persistence.'
      })
    }
  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
