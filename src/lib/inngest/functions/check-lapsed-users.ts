/**
 * Inngest scheduled function for sending win-back emails to lapsed users
 * Runs daily at 11am UTC — checks for users inactive for 3, 7, or 14 days
 */

import { inngest } from '../client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  sendLapsedDay3Email,
  sendLapsedDay7Email,
  sendLapsedDay14Email,
} from '@/lib/email/send'
import { getUnsubscribeUrl } from '@/lib/email/unsubscribe'

export const checkLapsedUsers = inngest.createFunction(
  {
    id: 'check-lapsed-users',
    name: 'Check Lapsed Users',
    retries: 2,
  },
  { cron: '0 11 * * *' }, // Daily at 11am UTC
  async ({ step }) => {
    console.log('[lapsed-users] Starting daily lapsed user check')

    // Step 1: Find lapsed users at 3, 7, or 14 day marks
    const lapsedUsers = await step.run('find-lapsed-users', async () => {
      const supabase = createServiceRoleClient()
      const now = new Date()

      // Calculate target dates (users whose last_active_at was exactly N days ago)
      const daysToCheck = [3, 7, 14]
      const results: Array<{
        userId: string
        email: string
        name: string | null
        daysSinceActive: number
        meta_json: Record<string, unknown> | null
      }> = []

      for (const days of daysToCheck) {
        const targetStart = new Date(now)
        targetStart.setUTCDate(targetStart.getUTCDate() - days)
        targetStart.setUTCHours(0, 0, 0, 0)

        const targetEnd = new Date(targetStart)
        targetEnd.setUTCHours(23, 59, 59, 999)

        const { data: users, error } = await supabase
          .from('users')
          .select('id, email, full_name, meta_json')
          .neq('email_reminders', false)
          .gte('last_active_at', targetStart.toISOString())
          .lte('last_active_at', targetEnd.toISOString())

        if (error) {
          console.error(`[lapsed-users] Error fetching ${days}-day lapsed users:`, error)
          continue
        }

        if (users) {
          for (const user of users) {
            results.push({
              userId: user.id,
              email: user.email,
              name: user.full_name,
              daysSinceActive: days,
              meta_json: user.meta_json as Record<string, unknown> | null,
            })
          }
        }
      }

      console.log(`[lapsed-users] Found ${results.length} lapsed users across all day marks`)
      return results
    })

    // Step 2: Send emails (rate-limited)
    const emailResults = await step.run('send-emails', async () => {
      let sent = 0
      let failed = 0
      let skipped = 0
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      const supabase = createServiceRoleClient()

      for (const user of lapsedUsers) {
        // Check if this lapsed email was already sent
        const meta = user.meta_json || {}
        const lapsedEmailsSent = (meta.lapsed_emails_sent as number[]) || []
        if (lapsedEmailsSent.includes(user.daysSinceActive)) {
          skipped++
          continue
        }

        try {
          const unsubscribeUrl = getUnsubscribeUrl(user.userId)

          switch (user.daysSinceActive) {
            case 3: {
              // Get due card count for day 3 email
              const { data: packs } = await supabase
                .from('study_packs')
                .select('id')
                .eq('user_id', user.userId)

              let dueCount = 0
              if (packs && packs.length > 0) {
                const { count } = await supabase
                  .from('flashcards')
                  .select('id', { count: 'exact', head: true })
                  .in('study_pack_id', packs.map(p => p.id))
                  .or(`due_at.is.null,due_at.lte.${new Date().toISOString()}`)

                dueCount = count || 0
              }

              await sendLapsedDay3Email(user.email, {
                name: user.name || undefined,
                dueCount,
                unsubscribeUrl,
              })
              break
            }

            case 7: {
              // Get streak for day 7 email
              const streakMeta = meta.streak as { currentStreak?: number } | undefined
              const streakDays = streakMeta?.currentStreak || 0

              await sendLapsedDay7Email(user.email, {
                name: user.name || undefined,
                streakDays,
                unsubscribeUrl,
              })
              break
            }

            case 14:
              await sendLapsedDay14Email(user.email, {
                name: user.name || undefined,
                unsubscribeUrl,
              })
              break
          }

          // Mark this lapsed email as sent
          const updatedMeta = {
            ...meta,
            lapsed_emails_sent: [...lapsedEmailsSent, user.daysSinceActive],
          }

          await supabase
            .from('users')
            .update({ meta_json: updatedMeta })
            .eq('id', user.userId)

          sent++
          await delay(600)
        } catch (error) {
          console.error(`[lapsed-users] Failed for ${user.email}:`, error)
          failed++
          await delay(1000)
        }
      }

      return { total: lapsedUsers.length, sent, failed, skipped }
    })

    console.log('[lapsed-users] Completed:', emailResults)
    return emailResults
  }
)
