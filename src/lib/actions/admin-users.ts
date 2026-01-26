'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

export type AdminUserPreview = {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    plan: string
    role: string
    created_at: string
}

export type UserActivityItem = {
    id: string
    type: 'study_pack' | 'tool_usage' | 'flashcard_review'
    name: string
    created_at: string
}

export type AdminUserDetails = AdminUserPreview & {
    stats: {
        total_packs: number
        total_completions: number
    }
    activity: UserActivityItem[]
}

/**
 * Fetch paginated user list with optional search alias
 */
export async function getAdminUsersList(page = 1, query = '', limit = 10): Promise<{ users: AdminUserPreview[], total: number }> {
    const supabase = createServiceRoleClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let dbQuery = supabase
        .from('users')
        .select('id, email, full_name, avatar_url, plan, role, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (query) {
        // Simple fuzzy search on email or full_name
        dbQuery = dbQuery.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    }

    const { data, count, error } = await dbQuery

    if (error) {
        console.error('Error fetching admin users list:', error)
        throw new Error('Failed to fetch users')
    }

    return {
        users: data || [],
        total: count || 0
    }
}

/**
 * Fetch Detailed User Profile
 */
export async function getAdminUserDetails(userId: string): Promise<AdminUserDetails | null> {
    const supabase = createServiceRoleClient()

    // 1. Fetch Basic Info
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, plan, role, created_at')
        .eq('id', userId)
        .single()

    if (userError || !user) return null

    // 2. Fetch Stats (Parallel)
    const [packsRes, completionsRes] = await Promise.all([
        supabase.from('study_packs').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('room_tool_completions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    // 3. Fetch Recent Activity (This is tricky to interleave efficiently in SQL without a Union View, so we do simple fetch & merge in JS for now)
    // Fetch last 5 packs
    const { data: recentPacks } = await supabase
        .from('study_packs')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch last 5 tool completions
    // We need to join with room_shared_tools to get the tool name, but let's keep it simple and just show "Tool Usage" if join is hard
    // Actually, let's try to join if possible. 'room_tool_completions' -> 'shared_tool_id' -> 'room_shared_tools' -> 'tool_id'
    // For now, simple select
    const { data: recentTools } = await supabase
        .from('room_tool_completions')
        .select('id, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10)

    // Merge and Sort
    const activity: UserActivityItem[] = [
        ...(recentPacks || []).map(p => ({
            id: p.id,
            type: 'study_pack' as const,
            name: `Created Study Pack: ${p.title}`,
            created_at: p.created_at
        })),
        ...(recentTools || []).map(t => ({
            id: t.id,
            type: 'tool_usage' as const,
            name: 'Completed a Learning Tool',
            created_at: t.completed_at
        }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10) // Limit to 10 total items

    return {
        ...user,
        stats: {
            total_packs: packsRes.count || 0,
            total_completions: completionsRes.count || 0
        },
        activity
    }
}
