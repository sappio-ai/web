/**
 * Inngest scheduled function for expiring extra packs
 * Runs daily at 1 AM UTC to mark expired purchases
 */

import { inngest } from '../client'
import { ExtraPacksService } from '@/lib/services/ExtraPacksService'

export const expireExtraPacks = inngest.createFunction(
  {
    id: 'expire-extra-packs',
    name: 'Expire Extra Packs',
    retries: 2,
  },
  { cron: '0 1 * * *' }, // Daily at 1 AM UTC
  async ({ step }) => {
    return await step.run('expire-extra-packs', async () => {
      console.log('[expire-extra-packs] Starting expiration job')

      try {
        const result = await ExtraPacksService.expirePurchases()

        console.log('[expire-extra-packs] Expiration job completed', {
          purchasesExpired: result.expired,
          usersAffected: result.usersAffected,
        })

        return {
          success: true,
          purchasesExpired: result.expired,
          usersAffected: result.usersAffected,
        }
      } catch (error) {
        console.error('[expire-extra-packs] Expiration job failed', error)
        throw error
      }
    })
  }
)
