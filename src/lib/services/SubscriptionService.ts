import { stripe } from '../stripe/client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { BenefitService } from './BenefitService'

export class SubscriptionService {
  // Find or create Stripe customer for user
  static async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    const supabase = createServiceRoleClient()
    const { data: user } = await supabase.from('users').select('stripe_customer_id').eq('id', userId).single()

    if (user?.stripe_customer_id) return user.stripe_customer_id

    const customer = await stripe.customers.create({ email, metadata: { userId } })
    await supabase.from('users').update({ stripe_customer_id: customer.id }).eq('id', userId)
    return customer.id
  }

  // Create subscription checkout session
  static async createCheckout(userId: string, email: string, plan: 'student_pro' | 'pro_plus', billingCycle: 'monthly' | 'semester'): Promise<{ url: string }> {
    const customerId = await this.getOrCreateCustomer(userId, email)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Check founding price lock
    const lockedPrices = await BenefitService.getLockedPrices(userId)

    let unitAmount: number
    let intervalCount = 1
    let productName: string

    if (plan === 'student_pro' && billingCycle === 'semester') {
      unitAmount = Math.round((lockedPrices?.student_pro_semester || 24.00) * 100)
      intervalCount = 6
      productName = 'Student Pro (Semester)'
    } else if (plan === 'student_pro') {
      unitAmount = Math.round((lockedPrices?.student_pro_monthly || 7.99) * 100)
      productName = 'Student Pro (Monthly)'
    } else {
      unitAmount = Math.round((lockedPrices?.pro_plus_monthly || 11.99) * 100)
      productName = 'Pro Plus (Monthly)'
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: productName },
          unit_amount: unitAmount,
          recurring: { interval: 'month', interval_count: intervalCount },
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: { userId, plan, billingCycle, productType: 'subscription' },
      subscription_data: { metadata: { userId, plan } },
    })

    if (!session.url) throw new Error('Failed to create checkout URL')
    return { url: session.url }
  }

  // Handle subscription events from webhook
  static async handleSubscriptionCreated(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId
    const plan = subscription.metadata?.plan
    if (!userId || !plan) return

    const supabase = createServiceRoleClient()
    await supabase.from('users').update({
      plan,
      stripe_subscription_id: subscription.id,
      plan_expires_at: null, // Active subscription, no expiry
    }).eq('id', userId)
  }

  static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId
    if (!userId) return

    const supabase = createServiceRoleClient()

    if (subscription.status === 'active') {
      const plan = subscription.metadata?.plan || 'student_pro'
      await supabase.from('users').update({ plan, plan_expires_at: null }).eq('id', userId)
    } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      // Keep plan active but log warning
      console.warn(`[Subscription] Past due for user ${userId}`)
    }
  }

  static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId
    if (!userId) return

    const supabase = createServiceRoleClient()
    await supabase.from('users').update({
      plan: 'free',
      stripe_subscription_id: null,
      plan_expires_at: null,
    }).eq('id', userId)
  }

  // Create Stripe Customer Portal session
  static async createPortalSession(userId: string): Promise<{ url: string }> {
    const supabase = createServiceRoleClient()
    const { data: user } = await supabase.from('users').select('stripe_customer_id').eq('id', userId).single()

    if (!user?.stripe_customer_id) throw new Error('No Stripe customer found')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    })

    return { url: session.url }
  }
}
