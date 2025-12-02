import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { validateEmail } from '@/lib/auth/validation'
import { generateResetToken } from '@/lib/auth/tokens'
import { sendPasswordResetEmail } from '@/lib/email/send'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS for user lookup
    const supabase = createServiceRoleClient()

    console.log('🔍 Looking up user by email:', email)

    // Find user by email in public.users table (case-insensitive)
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, email, auth_user_id')
      .ilike('email', email)
      .single()

    console.log('📊 Query result:', {
      found: !!user,
      error: queryError?.message,
      userEmail: user?.email,
      userId: user?.id
    })

    // Always return success to prevent email enumeration
    // If user doesn't exist, we still return success but don't send email
    if (user) {
      let resetLink = ''
      try {
        // Generate reset token
        const resetToken = await generateResetToken(user.id)

        // Create reset link
        resetLink = `${APP_URL}/reset-password?token=${resetToken}`

        // Send password reset email (this will throw if it fails)
        await sendPasswordResetEmail(user.email, resetLink)
        
        console.log(`✅ Password reset email sent successfully to ${user.email}`)
      } catch (error) {
        // Log the actual error for debugging
        console.error('❌ Failed to send password reset email:', error)
        console.error('Error details:', {
          email: user.email,
          resetLink: resetLink || 'Not generated',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        // Still return success to prevent enumeration
        // But the email won't be sent - check server logs
      }
    } else {
      console.log(`ℹ️ Password reset requested for non-existent email: ${email}`)
    }

    // Always return success message
    return NextResponse.json({
      message: 'If an account exists with that email, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
