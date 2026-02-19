/**
 * Inngest event-triggered function for onboarding drip emails
 * Receives delayed events fired after post-signup for days 2, 3, 5, 7
 */

import { inngest } from '../client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  sendSRSEducationEmail,
  sendQuizNudgeEmail,
  sendStudyTipsEmail,
  sendWeekRecapEmail,
} from '@/lib/email/send'
import { getUnsubscribeUrl } from '@/lib/email/unsubscribe'

export const onboardingDrip = inngest.createFunction(
  {
    id: 'onboarding-drip',
    name: 'Onboarding Drip Emails',
    retries: 2,
  },
  { event: 'email/onboarding-drip' },
  async ({ event, step }) => {
    const { userId, email, name, day } = event.data as {
      userId: string
      email: string
      name?: string
      day: number
    }

    console.log(`[onboarding-drip] Processing day ${day} drip for ${email}`)

    // Step 1: Check eligibility
    const eligible = await step.run('check-eligibility', async () => {
      const supabase = createServiceRoleClient()

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email_reminders, meta_json')
        .eq('id', userId)
        .single()

      if (error || !user) {
        console.log(`[onboarding-drip] User ${userId} not found, skipping`)
        return false
      }

      if (user.email_reminders === false) {
        console.log(`[onboarding-drip] User ${email} has opted out of emails`)
        return false
      }

      // Check if this day's email was already sent
      const meta = user.meta_json as Record<string, unknown> | null
      const onboarding = meta?.onboarding as { emails_sent?: number[] } | undefined
      if (onboarding?.emails_sent?.includes(day)) {
        console.log(`[onboarding-drip] Day ${day} email already sent to ${email}`)
        return false
      }

      return true
    })

    if (!eligible) {
      return { skipped: true, reason: 'not eligible', day }
    }

    // Step 2: Send email based on day
    const sendResult = await step.run('send-email', async () => {
      const unsubscribeUrl = getUnsubscribeUrl(userId)
      const supabase = createServiceRoleClient()
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const dashboardUrl = `${APP_URL}/dashboard`

      switch (day) {
        case 2:
          // Day 2: SRS Education - explain how spaced repetition works
          await sendSRSEducationEmail(email, {
            name,
            unsubscribeUrl,
          })
          break

        case 3:
          // Day 3: Quiz Nudge - encourage trying quiz mode
          await sendQuizNudgeEmail(email, {
            name,
            unsubscribeUrl,
          })
          break

        case 5:
          // Day 5: Study Tips
          await sendStudyTipsEmail(email, {
            name,
            unsubscribeUrl,
          })
          break

        case 7: {
          // Day 7: Week Recap with stats
          const { data: sessions } = await supabase
            .from('review_sessions')
            .select('id, cards_reviewed')
            .eq('user_id', userId)

          const { data: packs } = await supabase
            .from('study_packs')
            .select('id')
            .eq('user_id', userId)

          const cardsReviewed = sessions?.reduce((sum, s) => sum + (s.cards_reviewed || 0), 0) || 0
          const packsCreated = packs?.length || 0

          // Get streak from meta_json
          const { data: user } = await supabase
            .from('users')
            .select('meta_json')
            .eq('id', userId)
            .single()

          const meta = user?.meta_json as Record<string, unknown> | null
          const streak = meta?.streak as { currentStreak?: number } | undefined
          const streakDays = streak?.currentStreak || 0

          await sendWeekRecapEmail(email, {
            name,
            cardsReviewed,
            packsCreated,
            streakDays,
            unsubscribeUrl,
          })
          break
        }

        default:
          console.log(`[onboarding-drip] Unknown day ${day}, skipping`)
          return { sent: false }
      }

      return { sent: true }
    })

    if (!sendResult.sent) {
      return { skipped: true, reason: 'unknown day', day }
    }

    // Step 3: Mark this day as sent in meta_json
    await step.run('mark-sent', async () => {
      const supabase = createServiceRoleClient()

      const { data: user } = await supabase
        .from('users')
        .select('meta_json')
        .eq('id', userId)
        .single()

      const meta = (user?.meta_json as Record<string, unknown>) || {}
      const onboarding = (meta.onboarding as { emails_sent?: number[] }) || {}
      const emailsSent = onboarding.emails_sent || []

      const updatedMeta = {
        ...meta,
        onboarding: {
          ...onboarding,
          emails_sent: [...emailsSent, day],
        },
      }

      await supabase
        .from('users')
        .update({ meta_json: updatedMeta })
        .eq('id', userId)

      console.log(`[onboarding-drip] Marked day ${day} as sent for ${email}`)
    })

    console.log(`[onboarding-drip] Completed day ${day} for ${email}`)
    return { sent: true, day, email }
  }
)
