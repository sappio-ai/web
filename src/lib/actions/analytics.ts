'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

export type AnalyticsData = {
    users: {
        total: number
        newLast7Days: number
        pro: number
        free: number
        distribution: { name: string; value: number }[]
        growth: { date: string; count: number }[]
    }
    content: {
        totalStudyPacks: number
        totalFlashcards: number
    }
    engagement: {
        totalToolCompletions: number
        activeRooms: number
    }
    recentUsers: {
        id: string
        email: string
        full_name: string | null
        created_at: string
        avatar_url: string | null
        plan: string
    }[]
    recentFeedback: {
        id: string
        type: string
        message: string
        created_at: string
        status: string
        user_email: string | null
    }[]
}

/**
 * Fetch all analytics data for the admin dashboard
 * Cached for 5 minutes to prevent DB hammering
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
    // Use unstable_cache to cache the result
    return unstable_cache(
        async () => {
            const supabase = createServiceRoleClient()

            // 1. Fetch User Stats
            const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })

            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const { count: newUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString())

            const { count: proUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('plan', 'pro')

            const { count: freeUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('plan', 'free')

            // User Growth (Group by date for last 30 days)
            // This is a bit complex in pure Supabase JS without writing raw SQL or RPC
            // For now, we will fetch the last 1000 users and aggregate in JS for the chart
            // In a real production app with millions of users, use an SQL View or RPC
            const { data: usersForGraph } = await supabase
                .from('users')
                .select('created_at')
                .order('created_at', { ascending: false })
                .limit(1000)

            const growthMap = new Map<string, number>()
            usersForGraph?.forEach(u => {
                const date = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                growthMap.set(date, (growthMap.get(date) || 0) + 1)
            })

            // Convert map to array and reverse to be chronological (if we processed newer first)
            // Since 'usersForGraph' is desc, we processed newer first, so the map has newer dates.
            // We want the chart to be chronological.
            const growthData = Array.from(growthMap.entries())
                .map(([date, count]) => ({ date, count }))
                .reverse() // Basic aggregation, not perfect but good for a dash

            // 2. Content Stats
            const { count: totalStudyPacks } = await supabase.from('study_packs').select('*', { count: 'exact', head: true })
            const { count: totalFlashcards } = await supabase.from('flashcards').select('*', { count: 'exact', head: true })

            // 3. Engagement
            const { count: totalToolCompletions } = await supabase.from('room_tool_completions').select('*', { count: 'exact', head: true })
            const { count: activeRooms } = await supabase.from('study_rooms').select('*', { count: 'exact', head: true }) // Using total rooms as proxy for now

            // 4. Recent Users
            const { data: recentUsers } = await supabase
                .from('users')
                .select('id, email, full_name, created_at, avatar_url, plan')
                .order('created_at', { ascending: false })
                .limit(5)

            // 5. Recent Feedback
            const { data: recentFeedbackRaw } = await supabase
                .from('feedback')
                .select('id, type, message, created_at, status, email')
                .order('created_at', { ascending: false })
                .limit(5)

            const recentFeedback = (recentFeedbackRaw || []).map(f => ({
                ...f,
                user_email: f.email // Mapping to expected type
            }))

            return {
                users: {
                    total: totalUsers || 0,
                    newLast7Days: newUsers || 0,
                    pro: proUsers || 0,
                    free: freeUsers || 0,
                    distribution: [
                        { name: 'Free', value: freeUsers || 0 },
                        { name: 'Pro', value: proUsers || 0 },
                    ],
                    growth: growthData
                },
                content: {
                    totalStudyPacks: totalStudyPacks || 0,
                    totalFlashcards: totalFlashcards || 0
                },
                engagement: {
                    totalToolCompletions: totalToolCompletions || 0,
                    activeRooms: activeRooms || 0
                },
                recentUsers: recentUsers || [],
                recentFeedback: recentFeedback || []
            }
        },
        ['admin-analytics-v1'],
        { revalidate: 300, tags: ['admin-stats'] } // Cache for 5 mins
    )()
}
