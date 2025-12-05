/**
 * StripeService - Handles Stripe payment operations for extra packs
 */

import { stripe } from '../stripe/client'
import { ExtraPacksService } from './ExtraPacksService'

export interface CheckoutSession {
  sessionId: string
  url: string
}

export class StripeService {
  /**
   * Create Stripe checkout session for extra packs purchase
   */
  static async createExtraPacksCheckout(
    userId: string,
    quantity: number,
    price: number,
    userEmail?: string
  ): Promise<CheckoutSession> {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `${quantity} Extra Study Packs`,
                description: `One-time purchase of ${quantity} additional study packs. Valid for 6 months.`,
              },
              unit_amount: Math.round(price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/dashboard?purchase=success`,
        cancel_url: `${appUrl}/dashboard`,
        customer_email: userEmail,
        metadata: {
          userId,
          quantity: quantity.toString(),
          bundleType: quantity === 10 ? 'small' : quantity === 30 ? 'medium' : 'large',
          productType: 'extra_packs',
        },
      })

      if (!session.url) {
        throw new Error('Failed to create checkout session URL')
      }

      return {
        sessionId: session.id,
        url: session.url,
      }
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error)
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not set')
        return false
      }

      stripe.webhooks.constructEvent(payload, signature, webhookSecret)
      return true
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }

  /**
   * Handle successful payment from webhook
   */
  static async handlePaymentSuccess(
    session: any
  ): Promise<void> {
    try {
      const { userId, quantity } = session.metadata

      if (!userId || !quantity) {
        throw new Error('Missing required metadata in session')
      }

      const quantityNum = parseInt(quantity, 10)
      const amountPaid = session.amount_total / 100 // Convert from cents to euros

      console.log('Processing payment success:', {
        userId,
        quantity: quantityNum,
        amountPaid,
        paymentIntentId: session.payment_intent,
      })

      // Create the purchase record
      await ExtraPacksService.createPurchase(
        userId,
        quantityNum,
        amountPaid,
        session.payment_intent
      )

      console.log('Extra packs purchase created successfully')

      // Log analytics event
      // TODO: Add analytics tracking here if needed
    } catch (error) {
      console.error('Error handling payment success:', error)
      // Don't throw - we don't want to fail the webhook
      // Log for manual review instead
      console.error('MANUAL REVIEW REQUIRED: Payment succeeded but purchase creation failed', {
        sessionId: session.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Create a refund for a payment
   */
  static async createRefund(
    paymentIntentId: string,
    amount: number
  ): Promise<void> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
      })

      console.log('Refund created:', refund.id)
    } catch (error) {
      console.error('Error creating refund:', error)
      throw new Error(`Failed to create refund: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get payment intent details
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw new Error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
