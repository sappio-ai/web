import { createServiceRoleClient } from '@/lib/supabase/server'
import webPush from 'web-push'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails('mailto:hello@sappio.app', VAPID_PUBLIC, VAPID_PRIVATE)
}

export class PushService {
  static async subscribe(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
    }, { onConflict: 'user_id,endpoint' })
    if (error) console.error('Error saving push subscription:', error)
  }

  static async unsubscribe(userId: string, endpoint: string) {
    const supabase = createServiceRoleClient()
    await supabase.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', endpoint)
  }

  static async sendPush(userId: string, payload: { title: string; body: string; url?: string }) {
    const supabase = createServiceRoleClient()

    // Check if user has push enabled
    const { data: user } = await supabase.from('users').select('push_notifications').eq('id', userId).single()
    if (!user?.push_notifications) return

    const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', userId)
    if (!subs?.length) return

    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          JSON.stringify(payload)
        )
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired, remove it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
        console.error('Push send error:', err.message)
      }
    }
  }
}
