import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user (optional - allow anonymous feedback too)
        const { data: { user } } = await supabase.auth.getUser()

        const body = await request.json()
        const { type, message, pageUrl } = body

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        if (message.length > 5000) {
            return NextResponse.json(
                { error: 'Message is too long (max 5000 characters)' },
                { status: 400 }
            )
        }

        // Get user info if authenticated
        let userId = null
        let email = null

        if (user) {
            const { data: dbUser } = await supabase
                .from('users')
                .select('id, email')
                .eq('auth_user_id', user.id)
                .single()

            if (dbUser) {
                userId = dbUser.id
                email = dbUser.email
            }
        }

        // Insert feedback
        const { error: insertError } = await supabase
            .from('feedback')
            .insert({
                user_id: userId,
                email: email,
                type: type || 'general',
                message: message.trim(),
                page_url: pageUrl || null,
                user_agent: request.headers.get('user-agent') || null,
            })

        if (insertError) {
            console.error('Error inserting feedback:', insertError)
            return NextResponse.json(
                { error: 'Failed to submit feedback' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error submitting feedback:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
