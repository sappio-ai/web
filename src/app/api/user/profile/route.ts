import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user/profile - Get user profile
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile from public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: user.email,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        role: profile.role,
        plan: profile.plan,
        plan_expires_at: profile.plan_expires_at,
        locale: profile.locale,
        created_at: profile.created_at,
      }
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { full_name, username, avatar_url, locale } = body

    // Build update object with only provided fields
    const updates: Record<string, any> = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    if (locale !== undefined) updates.locale = locale

    // Handle username separately to check uniqueness
    if (username !== undefined) {
      // Check if username is already taken by another user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('auth_user_id', user.id)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }

      updates.username = username
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: user.email,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        role: profile.role,
        plan: profile.plan,
        plan_expires_at: profile.plan_expires_at,
        locale: profile.locale,
        created_at: profile.created_at,
      }
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
