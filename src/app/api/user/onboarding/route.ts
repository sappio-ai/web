import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action } = body

        if (!action) {
            return NextResponse.json({ error: 'Missing action' }, { status: 400 })
        }

        // Get current meta_json
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('meta_json')
            .eq('auth_user_id', user.id)
            .single()

        if (fetchError) {
            return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
        }

        const meta = userData.meta_json as Record<string, any> || {}
        if (!meta.onboarding) {
            meta.onboarding = {
                completed: false,
                seen_welcome: false,
                steps: {}
            }
        }

        // Update meta based on action
        if (action === 'seen_welcome') {
            meta.onboarding.seen_welcome = true
        } else if (action === 'complete_onboarding') {
            meta.onboarding.completed = true
        } else if (action === 'reviewed_flashcards') {
            meta.onboarding.has_reviewed_flashcards = true
        } else if (action === 'taken_quiz') {
            meta.onboarding.has_taken_quiz = true
        }

        // Update user record
        const { error: updateError } = await supabase
            .from('users')
            .update({ meta_json: meta })
            .eq('auth_user_id', user.id)

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 })
        }

        return NextResponse.json({ success: true, meta })
    } catch (error) {
        console.error('Error updating onboarding status:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
