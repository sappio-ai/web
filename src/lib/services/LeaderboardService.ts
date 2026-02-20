import { createServiceRoleClient } from '@/lib/supabase/server'

interface LeaderboardEntry {
  userId: string
  name: string
  avatarUrl: string | null
  weeklyXp: number
  level: number
  rank: number
}

export class LeaderboardService {
  static async getRoomLeaderboard(roomId: string): Promise<LeaderboardEntry[]> {
    const supabase = createServiceRoleClient()

    // Get room members
    const { data: members } = await supabase
      .from('room_members')
      .select('user_id')
      .eq('room_id', roomId)

    if (!members?.length) return []

    const memberIds = members.map(m => m.user_id)

    // Get Monday of current week
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    const weekStart = monday.toISOString()

    // Count events this week for these users
    const { data: cardEvents } = await supabase
      .from('events')
      .select('user_id')
      .in('user_id', memberIds)
      .eq('event', 'cards_reviewed')
      .gte('created_at', weekStart)

    const { data: quizEvents } = await supabase
      .from('events')
      .select('user_id')
      .in('user_id', memberIds)
      .eq('event', 'quiz_completed')
      .gte('created_at', weekStart)

    // Calculate XP per user
    const xpMap: Record<string, number> = {}
    for (const id of memberIds) xpMap[id] = 0
    for (const e of cardEvents || []) xpMap[e.user_id] = (xpMap[e.user_id] || 0) + 10
    for (const e of quizEvents || []) xpMap[e.user_id] = (xpMap[e.user_id] || 0) + 50

    // Get user profiles and XP levels
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .in('id', memberIds)

    const { data: xpData } = await supabase
      .from('user_xp')
      .select('user_id, level')
      .in('user_id', memberIds)

    const levelMap: Record<string, number> = {}
    for (const x of xpData || []) levelMap[x.user_id] = x.level

    // Build leaderboard
    const entries: LeaderboardEntry[] = (users || []).map(u => ({
      userId: u.id,
      name: u.full_name || 'Anonymous',
      avatarUrl: u.avatar_url,
      weeklyXp: xpMap[u.id] || 0,
      level: levelMap[u.id] || 1,
      rank: 0,
    }))

    // Sort by weekly XP descending
    entries.sort((a, b) => b.weeklyXp - a.weeklyXp)
    entries.forEach((e, i) => (e.rank = i + 1))

    return entries
  }
}
