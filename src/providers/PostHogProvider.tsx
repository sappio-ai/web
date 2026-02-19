'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Only init on client side
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
            })
        }
    }, [])

    // Identify user in PostHog when auth state changes
    useEffect(() => {
        const supabase = createBrowserClient()

        // Check current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                posthog.identify(session.user.id, {
                    email: session.user.email,
                    created_at: session.user.created_at,
                })
            }
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                posthog.identify(session.user.id, {
                    email: session.user.email,
                    created_at: session.user.created_at,
                })
            } else if (event === 'SIGNED_OUT') {
                posthog.reset()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
