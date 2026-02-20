// Streak Service for tracking user study streaks

import { createClient } from '@/lib/supabase/server'
import type { StreakData } from '@/lib/types/flashcards'

export class StreakService {
  /**
   * Update streak after review session
   */
  static async updateStreak(userId: string): Promise<StreakData> {
    const supabase = await createClient()

    // Get user's current streak data
    const { data: user } = await supabase
      .from('users')
      .select('meta_json')
      .eq('id', userId)
      .single()

    const streakData: StreakData = (user?.meta_json as any)?.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastReviewDate: null,
      totalReviews: 0,
    }

    const today = new Date().toISOString().split('T')[0]
    const lastReview = streakData.lastReviewDate

    // First review ever
    if (!lastReview) {
      streakData.currentStreak = 1
      streakData.longestStreak = 1
      streakData.lastReviewDate = today
      streakData.totalReviews = 1
    }
    // Already reviewed today
    else if (lastReview === today) {
      streakData.totalReviews++
    }
    // Reviewed yesterday (continue streak)
    else if (this.isYesterday(lastReview)) {
      streakData.currentStreak++
      streakData.longestStreak = Math.max(
        streakData.longestStreak,
        streakData.currentStreak
      )
      streakData.lastReviewDate = today
      streakData.totalReviews++
    }
    // Missed a day — check for streak freeze before resetting
    else {
      const freezes = streakData.freezes || 0
      if (freezes > 0) {
        // Consume a freeze to preserve the streak
        streakData.freezes = freezes - 1
        streakData.freezeJustUsed = true
        streakData.currentStreak++
        streakData.longestStreak = Math.max(
          streakData.longestStreak,
          streakData.currentStreak
        )
      } else {
        streakData.currentStreak = 1
      }
      streakData.lastReviewDate = today
      streakData.totalReviews++
    }

    // Award a streak freeze every 7 days (max 2)
    if (
      streakData.currentStreak > 0 &&
      streakData.currentStreak % 7 === 0 &&
      (streakData.freezes || 0) < 2
    ) {
      streakData.freezes = (streakData.freezes || 0) + 1
    }

    // Save updated streak
    const currentMetaJson = (user?.meta_json as any) || {}
    await supabase
      .from('users')
      .update({
        meta_json: {
          ...currentMetaJson,
          streak: streakData,
        },
      })
      .eq('id', userId)

    return streakData
  }

  /**
   * Check if date is yesterday
   */
  private static isYesterday(dateString: string): boolean {
    const date = new Date(dateString)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return (
      date.toISOString().split('T')[0] ===
      yesterday.toISOString().split('T')[0]
    )
  }

  /**
   * Get streak data for user
   */
  static async getStreak(userId: string): Promise<StreakData> {
    const supabase = await createClient()

    const { data: user } = await supabase
      .from('users')
      .select('meta_json')
      .eq('id', userId)
      .single()

    return (user?.meta_json as any)?.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastReviewDate: null,
      totalReviews: 0,
    }
  }
}
