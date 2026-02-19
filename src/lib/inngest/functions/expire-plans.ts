/**
 * Inngest scheduled function for expiring plans
 * Runs daily at midnight UTC to check for expired plans and downgrade users
 */

import { inngest } from '../client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { BenefitService } from '@/lib/services/BenefitService'
import { sendTrialExpiringEmail, sendTrialExpiredEmail } from '@/lib/email/send'

export const expirePlans = inngest.createFunction(
  {
    id: 'expire-plans',
    name: 'Expire Plans Daily',
    retries: 2,
  },
  { cron: '0 0 * * *' }, // Run daily at midnight UTC
  async ({ step }) => {
    console.log('[expire-plans] Starting plan expiration check')

    // Step 0: Send trial expiring soon emails (2 days before expiry)
    await step.run('send-trial-expiring-emails', async () => {
      const supabase = createServiceRoleClient()
      const now = new Date()
      const twoDaysFromNow = new Date(now)
      twoDaysFromNow.setUTCDate(twoDaysFromNow.getUTCDate() + 2)

      const dayStart = new Date(twoDaysFromNow)
      dayStart.setUTCHours(0, 0, 0, 0)
      const dayEnd = new Date(twoDaysFromNow)
      dayEnd.setUTCHours(23, 59, 59, 999)

      const { data: expiringUsers, error } = await supabase
        .from('users')
        .select('id, email, full_name, plan_expires_at')
        .not('plan_expires_at', 'is', null)
        .gte('plan_expires_at', dayStart.toISOString())
        .lte('plan_expires_at', dayEnd.toISOString())
        .neq('plan', 'free')

      if (error) {
        console.error('[expire-plans] Error fetching expiring users:', error)
        return { sent: 0, failed: 0 }
      }

      let sent = 0
      let failed = 0
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      for (const user of expiringUsers || []) {
        try {
          await sendTrialExpiringEmail(user.email, {
            name: user.full_name || undefined,
          })
          sent++
          await delay(600)
        } catch (err) {
          console.error(`[expire-plans] Failed to send expiring email to ${user.email}:`, err)
          failed++
        }
      }

      console.log(`[expire-plans] Sent ${sent} trial expiring emails (${failed} failed)`)
      return { sent, failed }
    })

    // Step 1: Find users with expired plans
    const expiredUsers = await step.run('find-expired-users', async () => {
      const supabase = createServiceRoleClient()
      
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, plan, plan_expires_at')
        .not('plan_expires_at', 'is', null)
        .lt('plan_expires_at', now)
        .neq('plan', 'free')
      
      if (error) {
        console.error('[expire-plans] Error fetching expired users:', error)
        throw error
      }
      
      console.log(`[expire-plans] Found ${data?.length || 0} expired users`)
      return data || []
    })

    // Step 2: Expire each user's plan
    const results = await step.run('expire-users', async () => {
      const succeeded: string[] = []
      const failed: Array<{ userId: string; error: string }> = []
      
      for (const user of expiredUsers) {
        try {
          console.log(`[expire-plans] Expiring plan for user ${user.email} (${user.id})`)
          await BenefitService.expireTrial(user.id)
          succeeded.push(user.id)
          console.log(`[expire-plans] Successfully expired plan for ${user.email}`)

          // Send trial expired email
          try {
            await sendTrialExpiredEmail(user.email, {
              name: user.full_name || undefined,
            })
          } catch (emailErr) {
            console.error(`[expire-plans] Failed to send expired email to ${user.email}:`, emailErr)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`[expire-plans] Failed to expire plan for ${user.id}:`, errorMessage)
          failed.push({ userId: user.id, error: errorMessage })
        }
      }
      
      return {
        total: expiredUsers.length,
        succeeded: succeeded.length,
        failed: failed.length,
        failures: failed,
      }
    })

    console.log('[expire-plans] Completed:', results)
    return results
  }
)
