'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createBrowserClient()

  // Robustly determine if we are in demo mode
  const demoId = '3747df11-0426-4749-8597-af89639e8d38'
  const isDemo = pathname?.includes(demoId) || pathname?.includes(process.env.NEXT_PUBLIC_DEMO_PACK_ID || demoId)

  useEffect(() => {
    // If it's demo mode, we don't need to check auth or redirect
    if (isDemo) {
      setLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isDemo && (event === 'SIGNED_OUT' || !session)) {
          router.push('/login')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, isDemo])

  // CRITICAL: Always handle demo mode first to prevent brief "not authorized" states
  if (isDemo) {
    return <>{children}</>
  }

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
