import { render } from '@react-email/render'
import { resend } from './resend'
import WelcomeEmail from './templates/WelcomeEmail'
import PasswordResetEmail from './templates/PasswordResetEmail'

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@sappio.app'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Sappio'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendWelcomeEmail(to: string, name?: string) {
  try {
    console.log('📧 Preparing to send welcome email...')
    console.log('  To:', to)
    console.log('  From:', `${FROM_NAME} <${FROM_EMAIL}>`)
    
    const html = await render(
      WelcomeEmail({
        name,
        dashboardUrl: `${APP_URL}/dashboard`,
      })
    )

    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: 'Welcome to Sappio! 🎉',
      html,
    })

    console.log('✅ Welcome email sent successfully!')
    console.log('  Email ID:', result.data?.id)
    console.log('  To:', to)
    
    return result
  } catch (error) {
    // Non-blocking: log error but don't throw
    console.error('❌ Failed to send welcome email')
    console.error('  Error:', error)
    console.error('  To:', to)
    
    if (error instanceof Error) {
      console.error('  Message:', error.message)
    }
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  try {
    console.log('📧 Preparing to send password reset email...')
    console.log('  To:', to)
    console.log('  From:', `${FROM_NAME} <${FROM_EMAIL}>`)
    console.log('  Reset link:', resetLink)
    
    const html = await render(
      PasswordResetEmail({
        resetLink,
        appUrl: APP_URL,
      })
    )

    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: 'Reset Your Sappio Password',
      html,
    })

    console.log('✅ Password reset email sent successfully!')
    console.log('  Email ID:', result.data?.id)
    console.log('  To:', to)
    
    return result
  } catch (error) {
    // This one should throw since password reset is critical
    console.error('❌ Failed to send password reset email')
    console.error('  Error:', error)
    console.error('  To:', to)
    console.error('  From:', `${FROM_NAME} <${FROM_EMAIL}>`)
    
    if (error instanceof Error) {
      console.error('  Message:', error.message)
      console.error('  Stack:', error.stack)
    }
    
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
