export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string   // Lucide icon name
  color: string  // Hex accent color
  hint: string   // How to earn (shown for locked badges)
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first_pack', name: 'First Pack', description: 'Created your first study pack', icon: 'Package', color: '#5A5FF0', hint: 'Create your first study pack' },
  { id: 'first_review', name: 'First Review', description: 'Completed your first review session', icon: 'Star', color: '#F59E0B', hint: 'Complete your first review session' },
  { id: 'quiz_taker', name: 'Quiz Taker', description: 'Completed a quiz', icon: 'PenTool', color: '#10B981', hint: 'Take any quiz' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Scored 90%+ on a quiz', icon: 'Trophy', color: '#F59E0B', hint: 'Score 90% or higher on a quiz' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day study streak', icon: 'Flame', color: '#EF4444', hint: 'Study 7 days in a row' },
  { id: 'month_master', name: 'Month Master', description: '30-day study streak', icon: 'Crown', color: '#F59E0B', hint: 'Study 30 days in a row' },
  { id: 'century_club', name: 'Century Club', description: 'Mastered 100 cards', icon: 'Hash', color: '#5A5FF0', hint: 'Master 100 flashcards' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Reviewed 50 cards in one session', icon: 'Zap', color: '#8B5CF6', hint: 'Review 50 cards in one session' },
  { id: 'perfectionist', name: 'Perfectionist', description: '100% accuracy in a review session', icon: 'Sparkles', color: '#10B981', hint: 'Get 100% accuracy in a session' },
  { id: 'study_buddy', name: 'Study Buddy', description: 'Joined a study room', icon: 'Users', color: '#3B82F6', hint: 'Join a study room' },
  { id: 'knowledge_builder', name: 'Knowledge Builder', description: 'Created 5 study packs', icon: 'BookOpen', color: '#5A5FF0', hint: 'Create 5 study packs' },
  { id: 'scholar', name: 'Scholar', description: 'Created 10 study packs', icon: 'GraduationCap', color: '#1A1D2E', hint: 'Create 10 study packs' },
]

export const XP_REWARDS = {
  CARD_REVIEWED: 10,
  QUIZ_COMPLETED: 50,
  PERFECT_SESSION: 25,
  DAILY_GOAL_MET: 100,
  STREAK_DAY: 15,
} as const

export const XP_PER_LEVEL = 500
export const DAILY_XP_GOAL = 100
