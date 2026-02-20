'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const [hasSubscription, setHasSubscription] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('users')
          .select('stripe_subscription_id')
          .eq('auth_user_id', user.id)
          .single()

        if (profile?.stripe_subscription_id) {
          setHasSubscription(true)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      }
    }

    checkSubscription()
  }, [])

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening portal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
      <p className="text-gray-400 mb-6">Settings page coming soon...</p>

      {hasSubscription && (
        <div className="bg-[#1E2235] rounded-xl border border-[#2A2F45] p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Subscription</h2>
          <p className="text-gray-400 text-sm mb-4">
            Manage your billing, update payment methods, or cancel your subscription.
          </p>
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Opening...' : 'Manage Subscription'}</span>
            {!isLoading && <ExternalLink className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
