/**
 * Inngest scheduled function for sending daily "cards due" email reminders
 * Runs daily at 9am UTC — finds users with due flashcards who haven't visited today
 */

import { inngest } from '../client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendCardsDueEmail } from '@/lib/email/send'
import { getUnsubscribeUrl } from '@/lib/email/unsubscribe'

export const sendDueReminders = inngest.createFunction(
  {
    id: 'send-due-reminders',
    name: 'Send Due Card Reminders',
    retries: 2,
  },
  { cron: '0 9 * * *' }, // Daily at 9am UTC
  async ({ step }) => {
    console.log('[due-reminders] Starting daily due card reminder check')

    // Step 1: Find users with due cards who haven't been active today and haven't opted out
    const usersWithDueCards = await step.run('find-users-with-due-cards', async () => {
      const supabase = createServiceRoleClient()
      const now = new Date().toISOString()
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      // Get all users who haven't opted out of emails and weren't active today
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, email_reminders')
        .or(`last_active_at.is.null,last_active_at.lt.${todayStart.toISOString()}`)
        .neq('email_reminders', false)

      if (error) {
        console.error('[due-reminders] Error fetching users:', error)
        throw error
      }

      if (!users || users.length === 0) {
        console.log('[due-reminders] No eligible users found')
        return []
      }

      // For each user, check if they have due cards
      const results: Array<{
        userId: string
        email: string
        name: string | null
        dueCount: number
        packCount: number
        streakDays: number
      }> = []

      for (const user of users) {
        // Get user's pack IDs first
        const { data: packs } = await supabase
          .from('study_packs')
          .select('id')
          .eq('user_id', user.id)

        if (!packs || packs.length === 0) continue

        const packIds = packs.map(p => p.id)

        // Get due flashcards count
        const { data: dueCards } = await supabase
          .from('flashcards')
          .select('study_pack_id')
          .in('study_pack_id', packIds)
          .or(`due_at.is.null,due_at.lte.${now}`)

        if (!dueCards || dueCards.length === 0) continue

        const dueCount = dueCards.length
        const packCount = new Set(dueCards.map(c => c.study_pack_id)).size

        // Get streak from review_sessions
        const { data: sessions } = await supabase
          .from('review_sessions')
          .select('started_at')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(60)

        let streakDays = 0
        if (sessions && sessions.length > 0) {
          const today = new Date()
          today.setUTCHours(0, 0, 0, 0)
          const checkDate = new Date(today)
          // Check yesterday first (since they haven't reviewed today yet)
          checkDate.setDate(checkDate.getDate() - 1)

          const sessionDates = new Set(
            sessions.map(s => {
              const d = new Date(s.started_at)
              return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
            })
          )

          while (sessionDates.has(`${checkDate.getUTCFullYear()}-${checkDate.getUTCMonth()}-${checkDate.getUTCDate()}`)) {
            streakDays++
            checkDate.setDate(checkDate.getDate() - 1)
          }
        }

        results.push({
          userId: user.id,
          email: user.email,
          name: user.full_name,
          dueCount,
          packCount,
          streakDays,
        })
      }

      console.log(`[due-reminders] Found ${results.length} users with due cards`)
      return results
    })

    // Step 2: Send emails
    const emailResults = await step.run('send-emails', async () => {
      let sent = 0
      let failed = 0

      for (const user of usersWithDueCards) {
        try {
          await sendCardsDueEmail(user.email, {
            name: user.name || undefined,
            dueCount: user.dueCount,
            packCount: user.packCount,
            streakDays: user.streakDays,
            unsubscribeUrl: getUnsubscribeUrl(user.userId),
          })
          sent++
        } catch (error) {
          console.error(`[due-reminders] Failed for ${user.email}:`, error)
          failed++
        }
      }

      return { total: usersWithDueCards.length, sent, failed }
    })

    console.log('[due-reminders] Completed:', emailResults)
    return emailResults
  }
)
