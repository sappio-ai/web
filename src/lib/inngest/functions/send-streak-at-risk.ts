/**
 * Inngest scheduled function for sending streak-at-risk emails
 * Runs every hour — finds users whose streak is at risk in their evening timezone (7pm)
 */

import { inngest } from '../client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendStreakAtRiskEmail } from '@/lib/email/send'
import { getUnsubscribeUrl } from '@/lib/email/unsubscribe'
import { PushService } from '@/lib/services/PushService'

export const sendStreakAtRisk = inngest.createFunction(
  {
    id: 'send-streak-at-risk',
    name: 'Send Streak At Risk Emails',
    retries: 2,
  },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    console.log('[streak-at-risk] Starting hourly streak at risk check')

    // Step 1: Find users whose streak is at risk and it's 7pm in their timezone
    const usersAtRisk = await step.run('find-users-at-risk', async () => {
      const supabase = createServiceRoleClient()
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD

      // Get users with active streaks who haven't reviewed today and haven't opted out
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, meta_json, timezone, email_reminders')
        .neq('email_reminders', false)

      if (error) {
        console.error('[streak-at-risk] Error fetching users:', error)
        throw error
      }

      if (!users || users.length === 0) {
        console.log('[streak-at-risk] No eligible users found')
        return []
      }

      const currentUtcHour = today.getUTCHours()

      const results: Array<{
        userId: string
        email: string
        name: string | null
        streakDays: number
      }> = []

      for (const user of users) {
        // Check if user has an active streak
        const meta = user.meta_json as Record<string, unknown> | null
        const streak = meta?.streak as { currentStreak?: number; lastReviewDate?: string } | undefined
        if (!streak || !streak.currentStreak || streak.currentStreak <= 0) continue

        // Check if they already reviewed today
        if (streak.lastReviewDate === todayStr) continue

        // Check if it's 7pm in their timezone
        const tz = user.timezone || 'UTC'
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            hour12: false,
          })
          const localHour = parseInt(formatter.format(today), 10)
          if (localHour !== 19) continue
        } catch {
          // Invalid timezone, skip
          continue
        }

        results.push({
          userId: user.id,
          email: user.email,
          name: user.full_name,
          streakDays: streak.currentStreak,
        })
      }

      console.log(`[streak-at-risk] Found ${results.length} users with at-risk streaks`)
      return results
    })

    // Step 2: Send emails (rate-limited to stay under Resend's 2 req/sec)
    const emailResults = await step.run('send-emails', async () => {
      let sent = 0
      let failed = 0
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      for (const user of usersAtRisk) {
        try {
          await sendStreakAtRiskEmail(user.email, {
            name: user.name || undefined,
            streakDays: user.streakDays,
            unsubscribeUrl: getUnsubscribeUrl(user.userId),
          })
          sent++
          // Send push notification (non-blocking)
          try {
            await PushService.sendPush(user.userId, {
              title: 'Streak at Risk!',
              body: `Don't lose your ${user.streakDays}-day streak!`,
              url: '/review',
            })
          } catch (pushErr) {
            console.error(`[streak-at-risk] Push failed for ${user.userId}:`, pushErr)
          }
          await delay(600)
        } catch (error) {
          console.error(`[streak-at-risk] Failed for ${user.email}:`, error)
          failed++
          await delay(1000)
        }
      }

      return { total: usersAtRisk.length, sent, failed }
    })

    console.log('[streak-at-risk] Completed:', emailResults)
    return emailResults
  }
)
