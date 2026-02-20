import { createServiceRoleClient } from '@/lib/supabase/server'
import { XP_PER_LEVEL, DAILY_XP_GOAL } from '@/lib/constants/badges'

interface BadgeContext {
  totalPacks?: number
  sessionCardsReviewed?: number
  sessionAccuracy?: number
  quizScore?: number
  streakDays?: number
  masteredCards?: number
  hasJoinedRoom?: boolean
}

interface XPResult {
  totalXp: number
  level: number
  dailyXp: number
  leveledUp: boolean
  dailyGoalMet: boolean
}

interface XPData {
  totalXp: number
  level: number
  dailyXp: number
  dailyXpDate: string
}

export class XPService {
  /**
   * Award XP to a user. Handles daily reset, level calculation, and daily goal bonus.
   */
  static async awardXP(userId: string, amount: number, reason: string): Promise<XPResult> {
    const supabase = createServiceRoleClient()
    const today = new Date().toISOString().split('T')[0]

    // Get current XP data
    const { data: existing } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', userId)
      .single()

    const previousLevel = existing ? existing.level : 1
    const previousDailyXp = existing && existing.daily_xp_date === today ? existing.daily_xp : 0
    const hadMetDailyGoal = previousDailyXp >= DAILY_XP_GOAL

    const newTotalXp = (existing?.total_xp || 0) + amount
    const newDailyXp = previousDailyXp + amount
    const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1
    const dailyGoalMet = newDailyXp >= DAILY_XP_GOAL && !hadMetDailyGoal

    const { error } = await supabase
      .from('user_xp')
      .upsert({
        user_id: userId,
        total_xp: newTotalXp,
        level: newLevel,
        daily_xp: newDailyXp,
        daily_xp_date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('Error awarding XP:', error)
      throw error
    }

    // Award daily goal bonus if just met (direct update, no recursion)
    let finalTotalXp = newTotalXp
    let finalLevel = newLevel
    if (dailyGoalMet) {
      const bonus = DAILY_XP_GOAL // 100 XP bonus
      finalTotalXp = newTotalXp + bonus
      finalLevel = Math.floor(finalTotalXp / XP_PER_LEVEL) + 1

      await supabase.from('user_xp').update({
        total_xp: finalTotalXp,
        level: finalLevel,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)

      console.log(`[XP] Daily goal bonus +${bonus} XP awarded to user ${userId}`)
    }

    return {
      totalXp: finalTotalXp,
      level: finalLevel,
      dailyXp: newDailyXp,
      leveledUp: finalLevel > previousLevel,
      dailyGoalMet,
    }
  }

  /**
   * Get current XP data for a user.
   */
  static async getXP(userId: string): Promise<XPData> {
    const supabase = createServiceRoleClient()
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!data) {
      return { totalXp: 0, level: 1, dailyXp: 0, dailyXpDate: today }
    }

    return {
      totalXp: data.total_xp,
      level: data.level,
      dailyXp: data.daily_xp_date === today ? data.daily_xp : 0,
      dailyXpDate: data.daily_xp_date || today,
    }
  }

  /**
   * Get daily XP progress.
   */
  static async getDailyProgress(userId: string): Promise<{ current: number; goal: number }> {
    const xp = await this.getXP(userId)
    return { current: xp.dailyXp, goal: DAILY_XP_GOAL }
  }

  /**
   * Award a badge to a user. Returns true if newly awarded.
   */
  static async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      // Unique constraint violation means already earned
      if (error.code === '23505') {
        return false
      }
      console.error('Error awarding badge:', error)
      throw error
    }

    return true
  }

  /**
   * Get all badges earned by a user.
   */
  static async getUserBadges(userId: string): Promise<{ badge_id: string; earned_at: string }[]> {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching badges:', error)
      throw error
    }

    return data || []
  }

  /**
   * Check conditions and award any newly earned badges.
   */
  static async checkAndAwardBadges(userId: string, context: BadgeContext): Promise<string[]> {
    const newBadges: string[] = []

    const checks: [boolean, string][] = [
      [context.totalPacks !== undefined && context.totalPacks >= 1, 'first_pack'],
      [context.sessionCardsReviewed !== undefined && context.sessionCardsReviewed >= 1, 'first_review'],
      [context.quizScore !== undefined, 'quiz_taker'],
      [context.quizScore !== undefined && context.quizScore >= 90, 'quiz_master'],
      [context.streakDays !== undefined && context.streakDays >= 7, 'week_warrior'],
      [context.streakDays !== undefined && context.streakDays >= 30, 'month_master'],
      [context.masteredCards !== undefined && context.masteredCards >= 100, 'century_club'],
      [context.sessionCardsReviewed !== undefined && context.sessionCardsReviewed >= 50, 'speed_demon'],
      [context.sessionAccuracy !== undefined && context.sessionAccuracy >= 100, 'perfectionist'],
      [context.hasJoinedRoom === true, 'study_buddy'],
      [context.totalPacks !== undefined && context.totalPacks >= 5, 'knowledge_builder'],
      [context.totalPacks !== undefined && context.totalPacks >= 10, 'scholar'],
    ]

    for (const [condition, badgeId] of checks) {
      if (condition) {
        const awarded = await this.awardBadge(userId, badgeId)
        if (awarded) {
          newBadges.push(badgeId)
        }
      }
    }

    return newBadges
  }
}
