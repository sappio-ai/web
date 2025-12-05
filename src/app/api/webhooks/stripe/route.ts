/**
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { StripeService } from '@/lib/services/StripeService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Received Stripe webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        // Check if this is an extra packs purchase
        if (session.metadata?.productType === 'extra_packs') {
          console.log('Processing extra packs purchase:', session.id)
          await StripeService.handlePaymentSuccess(session)
        }
        break
      }

      case 'payment_intent.succeeded': {
        console.log('Payment intent succeeded:', event.data.object.id)
        // Additional handling if needed
        break
      }

      case 'payment_intent.payment_failed': {
        console.log('Payment intent failed:', event.data.object.id)
        // Log for monitoring
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    // Still return 200 to prevent Stripe from retrying
    // Log the error for manual review
    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    )
  }
}
