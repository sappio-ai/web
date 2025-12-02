/**
 * UsageService - Handles plan limit enforcement and usage tracking
 */

import { createClient, createServiceRoleClient } from '../supabase/server'
import type {
  PlanTier,
  PlanLimits,
  UsageStats,
  UserProfile,
} from '../types/usage'
import { DEFAULT_PLAN_LIMITS as FALLBACK_LIMITS } from '../types/usage'

// Cache for plan limits (5 minute TTL)
const planLimitsCache = new Map<
  string,
  { limits: PlanLimits; timestamp: number }
>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export class UsageService {
  /**
   * Gets plan limits for a specific plan tier with caching
   */
  static async getPlanLimits(plan: PlanTier): Promise<PlanLimits> {
    // Check cache first
    const cached = planLimitsCache.get(plan)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.limits
    }

    // Use service role for background jobs
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan', plan)
      .single()

    if (error || !data) {
      console.warn(
        `Failed to fetch plan limits for ${plan}, using defaults:`,
        error
      )
      return FALLBACK_LIMITS[plan]
    }

    const limits: PlanLimits = {
      plan: data.plan as PlanTier,
      packsPerMonth: data.packs_per_month,
      cardsPerPack: data.cards_per_pack,
      questionsPerQuiz: data.questions_per_quiz,
      maxPagesPerMaterial: data.max_pages_per_material,
      maxTokensPerMaterial: data.max_tokens_per_material,
      mindmapNodesLimit: data.mindmap_nodes_limit,
      priorityProcessing: data.priority_processing,
    }

    // Update cache
    planLimitsCache.set(plan, { limits, timestamp: Date.now() })

    return limits
  }

  /**
   * Calculates the billing period start date based on user's billing anchor
   */
  static calculatePeriodStart(
    billingAnchor: number,
    _timezone: string = 'UTC'
  ): Date {
    const now = new Date()
    
    // Get current year and month
    let year = now.getFullYear()
    let month = now.getMonth() // 0-indexed

    // Get current day
    const currentDay = now.getDate()

    // If we're before the billing anchor day this month, use last month
    if (currentDay < billingAnchor) {
      month -= 1
      if (month < 0) {
        month = 11
        year -= 1
      }
    }

    // Create period start date
    // Handle case where billing anchor is beyond days in month (e.g., Feb 30)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const anchorDay = Math.min(billingAnchor, daysInMonth)

    return new Date(year, month, anchorDay, 0, 0, 0, 0)
  }

  /**
   * Calculates the billing period end date
   */
  static calculatePeriodEnd(periodStart: Date, billingAnchor: number): Date {
    const year = periodStart.getFullYear()
    const month = periodStart.getMonth()

    // Next month
    let nextMonth = month + 1
    let nextYear = year
    if (nextMonth > 11) {
      nextMonth = 0
      nextYear += 1
    }

    // Handle case where billing anchor is beyond days in next month
    const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate()
    const anchorDay = Math.min(billingAnchor, daysInNextMonth)

    // End is one day before the next period starts
    const periodEnd = new Date(nextYear, nextMonth, anchorDay, 0, 0, 0, 0)
    periodEnd.setDate(periodEnd.getDate() - 1)
    periodEnd.setHours(23, 59, 59, 999)

    return periodEnd
  }

  /**
   * Gets usage for the current billing period
   */
  static async getUsageForPeriod(
    userId: string,
    periodStart: Date
  ): Promise<number> {
    const supabase = await createClient()

    const periodStartStr = periodStart.toISOString().split('T')[0] // YYYY-MM-DD

    const { data, error } = await supabase
      .from('usage_counters')
      .select('packs_created')
      .eq('user_id', userId)
      .eq('period_start', periodStartStr)
      .single()

    if (error || !data) {
      // No usage record yet
      return 0
    }

    return data.packs_created
  }

  /**
   * Gets user profile with plan information
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    // Use service role for background jobs
    const supabase = createServiceRoleClient()

    console.log('Fetching user profile for:', userId)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Failed to fetch user profile:', error)
      throw new Error(`Failed to fetch user profile: ${error?.message}`)
    }

    console.log('User profile found:', data.id, 'plan:', data.plan)

    return {
      id: data.id,
      authUserId: data.auth_user_id,
      email: data.email,
      fullName: data.full_name || undefined,
      plan: data.plan as PlanTier,
      planExpiresAt: data.plan_expires_at
        ? new Date(data.plan_expires_at)
        : undefined,
      billingAnchor: data.billing_anchor || 1,
      timezone: data.timezone || 'UTC',
      createdAt: new Date(data.created_at),
    }
  }

  /**
   * Checks if user can create a pack (with grace window)
   */
  static async canCreatePack(userId: string): Promise<{
    allowed: boolean
    reason?: string
    usage?: UsageStats
  }> {
    try {
      const user = await this.getUserProfile(userId)
      const limits = await this.getPlanLimits(user.plan)
      const periodStart = this.calculatePeriodStart(
        user.billingAnchor,
        user.timezone
      )
      const periodEnd = this.calculatePeriodEnd(periodStart, user.billingAnchor)
      const currentUsage = await this.getUsageForPeriod(userId, periodStart)

      const usage: UsageStats = {
        currentUsage,
        limit: limits.packsPerMonth,
        percentUsed: (currentUsage / limits.packsPerMonth) * 100,
        remaining: limits.packsPerMonth - currentUsage,
        periodStart,
        periodEnd,
        isAtLimit: currentUsage >= limits.packsPerMonth,
        isNearLimit: currentUsage >= limits.packsPerMonth * 0.8,
        hasGraceWindow: currentUsage === limits.packsPerMonth, // Allow 1 extra
      }

      // Allow if under limit or in grace window (1 extra pack)
      if (currentUsage < limits.packsPerMonth) {
        return { allowed: true, usage }
      }

      // Grace window: allow 1 extra pack for better conversion
      if (currentUsage === limits.packsPerMonth) {
        return {
          allowed: true,
          usage,
          reason: 'grace_window',
        }
      }

      // Over limit
      return {
        allowed: false,
        usage,
        reason: 'quota_exceeded',
      }
    } catch (error) {
      console.error('Error checking pack quota:', error)
      return {
        allowed: false,
        reason: 'error',
      }
    }
  }

  /**
   * Consumes pack quota with idempotency
   */
  static async consumePackQuota(
    userId: string,
    idempotencyKey: string
  ): Promise<{
    success: boolean
    newCount: number
    usage?: UsageStats
  }> {
    try {
      const user = await this.getUserProfile(userId)
      const limits = await this.getPlanLimits(user.plan)
      const periodStart = this.calculatePeriodStart(
        user.billingAnchor,
        user.timezone
      )
      const periodEnd = this.calculatePeriodEnd(periodStart, user.billingAnchor)

      // Use service role for background jobs
      const supabase = createServiceRoleClient()

      // Call the atomic increment function
      const periodStartStr = periodStart.toISOString().split('T')[0]
      const periodEndStr = periodEnd.toISOString().split('T')[0]

      console.log('Consuming pack quota for user:', userId)

      const { data, error } = await supabase.rpc('increment_usage_counter', {
        p_user_id: userId,
        p_period_start: periodStartStr,
        p_period_end: periodEndStr,
        p_idempotency_key: idempotencyKey,
      })

      if (error) {
        console.error('Error consuming pack quota:', error)
        return { success: false, newCount: 0 }
      }

      console.log('Pack quota consumed, new count:', data)

      const newCount = data as number

      const usage: UsageStats = {
        currentUsage: newCount,
        limit: limits.packsPerMonth,
        percentUsed: (newCount / limits.packsPerMonth) * 100,
        remaining: limits.packsPerMonth - newCount,
        periodStart,
        periodEnd,
        isAtLimit: newCount >= limits.packsPerMonth,
        isNearLimit: newCount >= limits.packsPerMonth * 0.8,
        hasGraceWindow: newCount === limits.packsPerMonth,
      }

      return { success: true, newCount, usage }
    } catch (error) {
      console.error('Error consuming pack quota:', error)
      return { success: false, newCount: 0 }
    }
  }

  /**
   * Gets detailed usage statistics for a user
   */
  static async getUsageStats(userId: string): Promise<UsageStats> {
    const user = await this.getUserProfile(userId)
    const limits = await this.getPlanLimits(user.plan)
    const periodStart = this.calculatePeriodStart(
      user.billingAnchor,
      user.timezone
    )
    const periodEnd = this.calculatePeriodEnd(periodStart, user.billingAnchor)
    const currentUsage = await this.getUsageForPeriod(userId, periodStart)

    return {
      currentUsage,
      limit: limits.packsPerMonth,
      percentUsed: (currentUsage / limits.packsPerMonth) * 100,
      remaining: limits.packsPerMonth - currentUsage,
      periodStart,
      periodEnd,
      isAtLimit: currentUsage >= limits.packsPerMonth,
      isNearLimit: currentUsage >= limits.packsPerMonth * 0.8,
      hasGraceWindow: currentUsage === limits.packsPerMonth,
    }
  }

  /**
   * Checks if user is at or near their quota limit
   */
  static async checkQuotaWarning(userId: string): Promise<{
    shouldWarn: boolean
    percentUsed: number
    remaining: number
  }> {
    const stats = await this.getUsageStats(userId)

    return {
      shouldWarn: stats.isNearLimit,
      percentUsed: stats.percentUsed,
      remaining: stats.remaining,
    }
  }

  /**
   * Logs usage event for analytics
   */
  static async logUsageEvent(
    userId: string,
    event: 'pack_created' | 'quota_exceeded' | 'grace_window_used',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Use service role client for background jobs (no user session)
      const supabase = createServiceRoleClient()

      console.log('[UsageService] Logging event:', {
        userId,
        event,
        metadata,
      })

      const { error } = await supabase.from('events').insert({
        user_id: userId,
        event,
        props_json: metadata || {},
      })

      if (error) {
        console.error('[UsageService] Failed to insert event:', error)
      } else {
        console.log('[UsageService] Event logged successfully:', event)
      }
    } catch (error) {
      console.error('[UsageService] Exception logging usage event:', error)
      // Don't throw - logging failures shouldn't break the flow
    }
  }

  /**
   * Gets all plan limits (for admin/comparison purposes)
   */
  static async getAllPlanLimits(): Promise<PlanLimits[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('plan_limits')
      .select('*')
      .order('packs_per_month', { ascending: true })

    if (error || !data) {
      console.warn('Failed to fetch all plan limits, using defaults:', error)
      return Object.values(FALLBACK_LIMITS)
    }

    return data.map((row) => ({
      plan: row.plan as PlanTier,
      packsPerMonth: row.packs_per_month,
      cardsPerPack: row.cards_per_pack,
      questionsPerQuiz: row.questions_per_quiz,
      maxPagesPerMaterial: row.max_pages_per_material,
      maxTokensPerMaterial: row.max_tokens_per_material,
      mindmapNodesLimit: row.mindmap_nodes_limit,
      priorityProcessing: row.priority_processing,
    }))
  }

  /**
   * Clears the plan limits cache (useful after admin updates)
   */
  static clearCache(): void {
    planLimitsCache.clear()
  }
}
