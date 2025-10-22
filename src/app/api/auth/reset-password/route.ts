import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { validatePassword } from '@/lib/auth/validation'
import { validateResetToken, markTokenAsUsed } from '@/lib/auth/tokens'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    // Validate inputs
    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Validate the reset token
    const tokenValidation = await validateResetToken(token)
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error },
        { status: 400 }
      )
    }

    // Use service role client for admin operations
    const supabase = createServiceRoleClient()

    // Get the user's auth_user_id from public.users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('auth_user_id')
      .eq('id', tokenValidation.userId!)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update password in Supabase Auth using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.auth_user_id,
      { password }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Mark token as used
    await markTokenAsUsed(token)

    return NextResponse.json({
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
