import { createServiceRoleClient } from '@/lib/supabase/server'
import { XPService } from './XPService'

interface ChallengeDefinition {
  type: string
  name: string
  description: string
  target: number
  xpReward: number
  icon: string
}

const CHALLENGE_POOL: ChallengeDefinition[] = [
  { type: 'review_50', name: 'Card Crusher', description: 'Review 50 flashcards', target: 50, xpReward: 50, icon: 'BookOpen' },
  { type: 'review_100', name: 'Marathon Learner', description: 'Review 100 flashcards', target: 100, xpReward: 100, icon: 'Flame' },
  { type: 'quiz_complete', name: 'Quiz Whiz', description: 'Complete 2 quizzes', target: 2, xpReward: 50, icon: 'PenTool' },
  { type: 'quiz_score_90', name: 'Ace Student', description: 'Score 90%+ on a quiz', target: 1, xpReward: 75, icon: 'Trophy' },
  { type: 'earn_xp_200', name: 'XP Hunter', description: 'Earn 200 XP', target: 200, xpReward: 50, icon: 'Zap' },
  { type: 'sessions_3', name: 'Consistent Learner', description: 'Complete 3 review sessions', target: 3, xpReward: 50, icon: 'Target' },
  { type: 'perfect_session', name: 'Perfectionist', description: 'Get 100% accuracy in a session', target: 1, xpReward: 75, icon: 'Sparkles' },
  { type: 'streak_maintain', name: 'Streak Keeper', description: 'Maintain your streak for 5 days', target: 5, xpReward: 75, icon: 'Calendar' },
]

export class ChallengeService {
  static getWeekStart(): string {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  static async getOrCreateWeeklyChallenges(userId: string) {
    const supabase = createServiceRoleClient()
    const weekStart = this.getWeekStart()

    const { data: existing } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)

    if (existing && existing.length > 0) {
      return existing.map(c => ({
        ...c,
        ...CHALLENGE_POOL.find(p => p.type === c.challenge_type),
      }))
    }

    const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3)

    const rows = selected.map(c => ({
      user_id: userId,
      challenge_type: c.type,
      target_value: c.target,
      xp_reward: c.xpReward,
      week_start: weekStart,
    }))

    const { data: inserted } = await supabase
      .from('weekly_challenges')
      .insert(rows)
      .select()

    return (inserted || []).map(c => ({
      ...c,
      ...CHALLENGE_POOL.find(p => p.type === c.challenge_type),
    }))
  }

  static async updateProgress(userId: string, eventType: string, value: number = 1) {
    const supabase = createServiceRoleClient()
    const weekStart = this.getWeekStart()

    const mappings: Record<string, string[]> = {
      'card_reviewed': ['review_50', 'review_100'],
      'quiz_completed': ['quiz_complete'],
      'quiz_score': ['quiz_score_90'],
      'xp_earned': ['earn_xp_200'],
      'session_completed': ['sessions_3'],
      'perfect_session': ['perfect_session'],
      'streak_day': ['streak_maintain'],
    }

    const challengeTypes = mappings[eventType] || []
    if (!challengeTypes.length) return

    for (const challengeType of challengeTypes) {
      const { data: challenge } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_type', challengeType)
        .eq('week_start', weekStart)
        .is('completed_at', null)
        .single()

      if (!challenge) continue

      let newValue = challenge.current_value
      if (eventType === 'quiz_score') {
        newValue = value >= 90 ? challenge.target_value : challenge.current_value
      } else {
        newValue = challenge.current_value + value
      }

      const completed = newValue >= challenge.target_value

      await supabase.from('weekly_challenges').update({
        current_value: Math.min(newValue, challenge.target_value),
        ...(completed ? { completed_at: new Date().toISOString() } : {}),
      }).eq('id', challenge.id)

      if (completed) {
        await XPService.awardXP(userId, challenge.xp_reward, `challenge_${challengeType}`)
      }
    }
  }
}
