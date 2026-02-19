import { render } from '@react-email/render'
import { resend } from './resend'
import WelcomeEmail from './templates/WelcomeEmail'
import PasswordResetEmail from './templates/PasswordResetEmail'
import CardsDueEmail from './templates/CardsDueEmail'
import PackReadyEmail from './templates/PackReadyEmail'
import StreakAtRiskEmail from './templates/StreakAtRiskEmail'
import SRSEducationEmail from './templates/SRSEducationEmail'
import QuizNudgeEmail from './templates/QuizNudgeEmail'
import StudyTipsEmail from './templates/StudyTipsEmail'
import WeekRecapEmail from './templates/WeekRecapEmail'
import LapsedDay3Email from './templates/LapsedDay3Email'
import LapsedDay7Email from './templates/LapsedDay7Email'
import LapsedDay14Email from './templates/LapsedDay14Email'

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

export async function sendCardsDueEmail(
  to: string,
  options: { name?: string; dueCount: number; packCount: number; streakDays: number; unsubscribeUrl?: string }
) {
  try {
    const html = await render(
      CardsDueEmail({
        name: options.name,
        dueCount: options.dueCount,
        packCount: options.packCount,
        streakDays: options.streakDays,
        dashboardUrl: `${APP_URL}/dashboard`,
        unsubscribeUrl: options.unsubscribeUrl,
      })
    )

    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `You have ${options.dueCount} card${options.dueCount !== 1 ? 's' : ''} due for review`,
      html,
    })

    console.log(`📧 Cards due email sent to ${to} (${options.dueCount} cards)`)
    return result
  } catch (error) {
    console.error(`❌ Failed to send cards due email to ${to}:`, error)
    throw error
  }
}

export async function sendPackReadyEmail(
  to: string,
  options: { name?: string; packTitle: string; studyPackId: string }
) {
  try {
    const packUrl = `${APP_URL}/study-packs/${options.studyPackId}`
    const html = await render(
      PackReadyEmail({
        name: options.name,
        packTitle: options.packTitle,
        packUrl,
        dashboardUrl: APP_URL,
      })
    )

    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `Your study pack "${options.packTitle}" is ready!`,
      html,
    })

    console.log(`📧 Pack ready email sent to ${to} for "${options.packTitle}"`)
    return result
  } catch (error) {
    console.error(`❌ Failed to send pack ready email to ${to}:`, error)
  }
}

export async function sendStreakAtRiskEmail(
  to: string,
  options: { name?: string; streakDays: number; unsubscribeUrl?: string }
) {
  const html = await render(
    StreakAtRiskEmail({
      name: options.name,
      streakDays: options.streakDays,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `Don't lose your ${options.streakDays}-day streak!`,
    html,
  })

  console.log(`📧 Streak at risk email sent to ${to} (${options.streakDays} day streak)`)
  return result
}

export async function sendSRSEducationEmail(
  to: string,
  options: { name?: string; unsubscribeUrl?: string }
) {
  const html = await render(
    SRSEducationEmail({
      name: options.name,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'How spaced repetition supercharges your memory',
    html,
  })

  console.log(`📧 SRS education email sent to ${to}`)
  return result
}

export async function sendQuizNudgeEmail(
  to: string,
  options: { name?: string; unsubscribeUrl?: string }
) {
  const html = await render(
    QuizNudgeEmail({
      name: options.name,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'Have you tried Quiz Mode yet?',
    html,
  })

  console.log(`📧 Quiz nudge email sent to ${to}`)
  return result
}

export async function sendStudyTipsEmail(
  to: string,
  options: { name?: string; unsubscribeUrl?: string }
) {
  const html = await render(
    StudyTipsEmail({
      name: options.name,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '5 tips to get the most out of Sappio',
    html,
  })

  console.log(`📧 Study tips email sent to ${to}`)
  return result
}

export async function sendWeekRecapEmail(
  to: string,
  options: { name?: string; cardsReviewed: number; packsCreated: number; streakDays: number; unsubscribeUrl?: string }
) {
  const html = await render(
    WeekRecapEmail({
      name: options.name,
      cardsReviewed: options.cardsReviewed,
      packsCreated: options.packsCreated,
      streakDays: options.streakDays,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'Your first week on Sappio - here\'s your recap!',
    html,
  })

  console.log(`📧 Week recap email sent to ${to}`)
  return result
}

export async function sendLapsedDay3Email(
  to: string,
  options: { name?: string; dueCount: number; unsubscribeUrl?: string }
) {
  const html = await render(
    LapsedDay3Email({
      name: options.name,
      dueCount: options.dueCount,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `You have ${options.dueCount} card${options.dueCount !== 1 ? 's' : ''} waiting for you`,
    html,
  })

  console.log(`📧 Lapsed day 3 email sent to ${to}`)
  return result
}

export async function sendLapsedDay7Email(
  to: string,
  options: { name?: string; streakDays: number; unsubscribeUrl?: string }
) {
  const html = await render(
    LapsedDay7Email({
      name: options.name,
      streakDays: options.streakDays,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'We miss you! Your study packs are waiting',
    html,
  })

  console.log(`📧 Lapsed day 7 email sent to ${to}`)
  return result
}

export async function sendLapsedDay14Email(
  to: string,
  options: { name?: string; unsubscribeUrl?: string }
) {
  const html = await render(
    LapsedDay14Email({
      name: options.name,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: options.unsubscribeUrl,
    })
  )

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'It\'s been a while - come back and study!',
    html,
  })

  console.log(`📧 Lapsed day 14 email sent to ${to}`)
  return result
}

export async function sendTrialExpiringEmail(
  to: string,
  options: { name?: string }
) {
  // Simple text-based email since no template exists yet
  const greeting = options.name ? `Hi ${options.name}` : 'Hi there'
  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>${greeting},</h2>
    <p>Just a heads up - your Sappio trial expires in <strong>2 days</strong>.</p>
    <p>To keep all your premium features (unlimited study packs, AI generation, and more), upgrade your plan before it expires.</p>
    <p><a href="${APP_URL}/settings/billing" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Upgrade Now</a></p>
    <p>If you have any questions, just reply to this email.</p>
    <p>— The Sappio Team</p>
  </div>`

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'Your Sappio trial expires in 2 days',
    html,
  })

  console.log(`📧 Trial expiring email sent to ${to}`)
  return result
}

export async function sendTrialExpiredEmail(
  to: string,
  options: { name?: string }
) {
  const greeting = options.name ? `Hi ${options.name}` : 'Hi there'
  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>${greeting},</h2>
    <p>Your Sappio trial has ended. You've been moved to the free plan.</p>
    <p>Don't worry - all your study packs and progress are saved. You can upgrade anytime to unlock premium features again.</p>
    <p><a href="${APP_URL}/settings/billing" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Upgrade Now</a></p>
    <p>Thanks for trying Sappio!</p>
    <p>— The Sappio Team</p>
  </div>`

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'Your Sappio trial has ended',
    html,
  })

  console.log(`📧 Trial expired email sent to ${to}`)
  return result
}
