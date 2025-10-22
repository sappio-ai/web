import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email).catch((err) => {
      console.error('Failed to send welcome email:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post-signup error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
