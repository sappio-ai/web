import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    if (data.user) {
      // Send welcome email for new OAuth users (non-blocking)
      // Check if this is a new user by checking if they were just created
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('created_at')
        .eq('auth_user_id', data.user.id)
        .single()

      if (!userError && userData) {
        const createdAt = new Date(userData.created_at)
        const now = new Date()
        const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000

        // If user was created within the last 30 seconds, send welcome email
        // More lenient timing to account for OAuth flow delays
        if (diffInSeconds < 30) {
          sendWelcomeEmail(data.user.email!).catch((err) => {
            console.error('Failed to send welcome email:', err)
          })
        }
      } else if (userError) {
        console.error('Error checking user creation time:', userError)
      }
    }

    // Redirect to the dashboard or specified next URL
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
