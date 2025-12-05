/**
 * ExtraPacksService - Handles extra study pack purchases and balance management
 */

import { createServiceRoleClient } from '../supabase/server'

export interface ExtraPackPurchase {
  id: string
  userId: string
  quantity: number
  amountPaid: number
  currency: string
  stripePaymentIntentId: string | null
  purchasedAt: Date
  expiresAt: Date
  consumed: number
  status: 'active' | 'expired' | 'refunded'
  refundedAt?: Date
  refundAmount?: number
}

export interface PackBundle {
  quantity: 10 | 30 | 75
  price: number
  pricePerPack: number
  popular?: boolean
}

export interface AvailableBalance {
  total: number
  purchases: ExtraPackPurchase[]
  nearestExpiration?: Date
}

export class ExtraPacksService {
  /**
   * Get available pack bundles
   */
  static getBundles(): PackBundle[] {
    return [
      { quantity: 10, price: 2.99, pricePerPack: 0.299 },
      { quantity: 30, price: 6.99, pricePerPack: 0.233, popular: true },
      { quantity: 75, price: 14.99, pricePerPack: 0.2 },
    ]
  }

  /**
   * Get user's available extra packs balance
   */
  static async getAvailableBalance(
    userId: string
  ): Promise<AvailableBalance> {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase.rpc('get_available_extra_packs', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error fetching extra packs balance:', error)
      throw new Error(`Failed to fetch extra packs balance: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return {
        total: 0,
        purchases: [],
        nearestExpiration: undefined,
      }
    }

    const result = data[0]
    const purchases = (result.purchases as any[]).map((p) => ({
      id: p.id,
      userId,
      quantity: p.quantity,
      amountPaid: parseFloat(p.amountPaid),
      currency: p.currency,
      stripePaymentIntentId: null,
      purchasedAt: new Date(p.purchasedAt),
      expiresAt: new Date(p.expiresAt),
      consumed: p.consumed,
      status: 'active' as const,
    }))

    return {
      total: result.total_available || 0,
      purchases,
      nearestExpiration: result.nearest_expiration
        ? new Date(result.nearest_expiration)
        : undefined,
    }
  }

  /**
   * Create a new extra pack purchase
   */
  static async createPurchase(
    userId: string,
    quantity: number,
    amountPaid: number,
    stripePaymentIntentId: string
  ): Promise<ExtraPackPurchase> {
    const supabase = createServiceRoleClient()

    const purchasedAt = new Date()
    const expiresAt = new Date(purchasedAt)
    expiresAt.setMonth(expiresAt.getMonth() + 6)

    const { data, error } = await supabase
      .from('extra_pack_purchases')
      .insert({
        user_id: userId,
        quantity,
        amount_paid: amountPaid,
        currency: 'EUR',
        stripe_payment_intent_id: stripePaymentIntentId,
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        consumed: 0,
        status: 'active',
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating extra pack purchase:', error)
      throw new Error(`Failed to create purchase: ${error?.message}`)
    }

    return {
      id: data.id,
      userId: data.user_id,
      quantity: data.quantity,
      amountPaid: parseFloat(data.amount_paid),
      currency: data.currency,
      stripePaymentIntentId: data.stripe_payment_intent_id,
      purchasedAt: new Date(data.purchased_at),
      expiresAt: new Date(data.expires_at),
      consumed: data.consumed,
      status: data.status as 'active' | 'expired' | 'refunded',
    }
  }

  /**
   * Consume extra packs (FIFO - oldest first)
   */
  static async consumeExtraPacks(
    userId: string,
    count: number,
    idempotencyKey: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const supabase = createServiceRoleClient()

    try {
      const { data, error } = await supabase.rpc('consume_extra_pack', {
        p_user_id: userId,
        p_count: count,
        p_idempotency_key: idempotencyKey,
      })

      if (error) {
        console.error('Error consuming extra packs:', error)
        return { success: false, newBalance: 0 }
      }

      if (!data || data.length === 0) {
        return { success: false, newBalance: 0 }
      }

      const result = data[0]
      return {
        success: result.success,
        newBalance: result.new_balance,
      }
    } catch (error) {
      console.error('Exception consuming extra packs:', error)
      return { success: false, newBalance: 0 }
    }
  }

  /**
   * Check if a purchase can be refunded
   */
  static async canRefund(
    purchaseId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('extra_pack_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (error || !data) {
      return { allowed: false, reason: 'Purchase not found' }
    }

    // Check if already refunded
    if (data.status === 'refunded') {
      return { allowed: false, reason: 'Already refunded' }
    }

    // Check if any packs consumed
    if (data.consumed > 0) {
      return { allowed: false, reason: 'Packs already consumed' }
    }

    // Check if within 14 days
    const purchasedAt = new Date(data.purchased_at)
    const daysSincePurchase =
      (Date.now() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSincePurchase > 14) {
      return { allowed: false, reason: 'Refund window expired (14 days)' }
    }

    return { allowed: true }
  }

  /**
   * Process a refund
   */
  static async processRefund(
    purchaseId: string,
    refundAmount: number
  ): Promise<void> {
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('extra_pack_purchases')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refundAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId)

    if (error) {
      console.error('Error processing refund:', error)
      throw new Error(`Failed to process refund: ${error.message}`)
    }
  }

  /**
   * Expire old purchases (called by cron job)
   */
  static async expirePurchases(): Promise<{
    expired: number
    usersAffected: number
  }> {
    const supabase = createServiceRoleClient()

    // Get purchases to expire
    const { data: toExpire, error: fetchError } = await supabase
      .from('extra_pack_purchases')
      .select('id, user_id')
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching purchases to expire:', fetchError)
      throw new Error(`Failed to fetch purchases: ${fetchError.message}`)
    }

    if (!toExpire || toExpire.length === 0) {
      return { expired: 0, usersAffected: 0 }
    }

    // Update status to expired
    const { error: updateError } = await supabase
      .from('extra_pack_purchases')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())

    if (updateError) {
      console.error('Error expiring purchases:', updateError)
      throw new Error(`Failed to expire purchases: ${updateError.message}`)
    }

    // Count unique users affected
    const uniqueUsers = new Set(toExpire.map((p) => p.user_id))

    return {
      expired: toExpire.length,
      usersAffected: uniqueUsers.size,
    }
  }
}
