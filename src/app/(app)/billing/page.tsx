'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  Sparkles,
  Crown,
  Zap,
  Check,
  Calendar,
  Receipt,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface UserBillingData {
  id: string
  plan: 'free' | 'student_pro' | 'pro_plus'
  plan_expires_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  meta_json: any
  created_at: string
}

const PLAN_DETAILS = {
  free: {
    name: 'Free Plan',
    icon: Zap,
    color: '#10B981',
    bgColor: '#10B981/10',
    price: '€0',
    period: 'forever',
    features: [
      '5 packs per month',
      '40 cards per pack',
      '15-question quizzes',
      '80 mind map nodes',
    ],
  },
  student_pro: {
    name: 'Student Pro',
    icon: Sparkles,
    color: '#5A5FF0',
    bgColor: '#5A5FF0/10',
    price: '€7.99',
    period: '/month',
    features: [
      '60 packs per month',
      '120 cards per pack',
      '30-question quizzes',
      '250 mind map nodes',
      'All export formats',
      'Timed quiz mode',
      'Priority processing',
    ],
  },
  pro_plus: {
    name: 'Pro Plus',
    icon: Crown,
    color: '#F59E0B',
    bgColor: '#F59E0B/10',
    price: '€11.99',
    period: '/month',
    features: [
      '300 packs per month',
      '300 cards per pack',
      '60-question quizzes',
      '800 mind map nodes',
      'All export formats',
      'Advanced analytics',
      'Priority processing',
      'API access (coming soon)',
    ],
  },
}

export default function BillingPage() {
  const [userData, setUserData] = useState<UserBillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('users')
          .select('id, plan, plan_expires_at, stripe_customer_id, stripe_subscription_id, meta_json, created_at')
          .eq('auth_user_id', user.id)
          .single()

        if (data) setUserData(data as UserBillingData)
      } catch (error) {
        console.error('Error fetching billing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true)
      const res = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        console.error('Portal error:', data.error)
      }
    } catch (error) {
      console.error('Error opening portal:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#5A5FF0] animate-spin" />
      </div>
    )
  }

  const plan = userData?.plan || 'free'
  const planInfo = PLAN_DETAILS[plan]
  const PlanIcon = planInfo.icon
  const hasSubscription = !!userData?.stripe_subscription_id
  const isTrialing = userData?.meta_json?.trial && userData?.plan !== 'free'
  const trialExpiresAt = userData?.meta_json?.trial?.expires_at

  return (
    <div className="min-h-screen bg-[#F8FAFB] relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      {/* Header */}
      <div className="relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pt-24">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#5A5FF0] transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-[36px] font-bold text-[#1A1D2E] mb-2 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            Billing & Subscription
          </h1>
          <p className="text-[#64748B] text-[16px]">Manage your plan, payment methods, and invoices</p>
        </div>

        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="relative">
            <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
            <div className="relative bg-white rounded-xl p-6 lg:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan === 'pro_plus' ? 'bg-[#F59E0B]/10' :
                    plan === 'student_pro' ? 'bg-[#5A5FF0]/10' :
                    'bg-[#10B981]/10'
                  }`}>
                    <PlanIcon className={`w-6 h-6 ${
                      plan === 'pro_plus' ? 'text-[#F59E0B]' :
                      plan === 'student_pro' ? 'text-[#5A5FF0]' :
                      'text-[#10B981]'
                    }`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1A1D2E]">{planInfo.name}</h2>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-[#1A1D2E]">{planInfo.price}</span>
                      <span className="text-[#64748B] text-sm">{planInfo.period}</span>
                    </div>
                    {isTrialing && trialExpiresAt && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF3C7] text-[#D97706] rounded-lg text-xs font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Trial ends {formatDate(trialExpiresAt)}
                      </div>
                    )}
                    {userData?.plan_expires_at && !isTrialing && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FEE2E2] text-[#DC2626] rounded-lg text-xs font-semibold">
                        <Calendar className="w-3 h-3" />
                        Expires {formatDate(userData.plan_expires_at)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  {plan === 'free' ? (
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Upgrade Plan
                    </button>
                  ) : hasSubscription ? (
                    <button
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#F8FAFB] text-[#1A1D2E] font-semibold rounded-xl text-sm transition-all border border-[#E2E8F0] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {portalLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                      {portalLoading ? 'Opening...' : 'Manage on Stripe'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Change Plan
                    </button>
                  )}
                </div>
              </div>

              {/* Features list */}
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Your plan includes</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {planInfo.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 flex-shrink-0 ${
                        plan === 'pro_plus' ? 'text-[#F59E0B]' :
                        plan === 'student_pro' ? 'text-[#5A5FF0]' :
                        'text-[#10B981]'
                      }`} />
                      <span className="text-sm text-[#4A5568]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Invoices Section */}
          {hasSubscription && (
            <div className="relative">
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
              <div className="relative bg-white rounded-xl p-6 lg:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                <h3 className="text-lg font-bold text-[#1A1D2E] mb-4">Payment & Invoices</h3>

                <div className="space-y-4">
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#5A5FF0]/30 hover:bg-[#F8FAFB] transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#5A5FF0]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#1A1D2E]">Payment Methods</p>
                        <p className="text-xs text-[#64748B]">Update your card or payment method</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#94A3B8] group-hover:text-[#5A5FF0] transition-colors" />
                  </button>

                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#5A5FF0]/30 hover:bg-[#F8FAFB] transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-[#5A5FF0]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#1A1D2E]">Invoices & Receipts</p>
                        <p className="text-xs text-[#64748B]">View and download past invoices</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#94A3B8] group-hover:text-[#5A5FF0] transition-colors" />
                  </button>

                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#EF4444]/30 hover:bg-[#FEF2F2] transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#1A1D2E]">Cancel Subscription</p>
                        <p className="text-xs text-[#64748B]">Downgrade to the free plan</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#94A3B8] group-hover:text-[#EF4444] transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compare Plans (for free users) */}
          {plan === 'free' && (
            <div className="relative">
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
              <div className="relative bg-white rounded-xl p-6 lg:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                <h3 className="text-lg font-bold text-[#1A1D2E] mb-2">Upgrade Your Plan</h3>
                <p className="text-sm text-[#64748B] mb-6">Unlock more features and supercharge your studying</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Student Pro */}
                  <div className="p-5 rounded-xl border-2 border-[#5A5FF0]/30 bg-[#5A5FF0]/[0.02] relative">
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-[#5A5FF0] text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                      Most Popular
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-[#5A5FF0]" />
                      <h4 className="font-bold text-[#1A1D2E]">Student Pro</h4>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-[#1A1D2E]">€7.99</span>
                      <span className="text-sm text-[#64748B]">/month</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {PLAN_DETAILS.student_pro.features.slice(0, 5).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-[#4A5568]">
                          <Check className="w-3.5 h-3.5 text-[#5A5FF0] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="w-full py-2.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      Upgrade to Pro
                    </button>
                  </div>

                  {/* Pro Plus */}
                  <div className="p-5 rounded-xl border border-[#E2E8F0] hover:border-[#F59E0B]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-5 h-5 text-[#F59E0B]" />
                      <h4 className="font-bold text-[#1A1D2E]">Pro Plus</h4>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-[#1A1D2E]">€11.99</span>
                      <span className="text-sm text-[#64748B]">/month</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {PLAN_DETAILS.pro_plus.features.slice(0, 5).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-[#4A5568]">
                          <Check className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="w-full py-2.5 bg-white hover:bg-[#F8FAFB] text-[#1A1D2E] font-bold rounded-xl text-sm transition-all border border-[#E2E8F0] shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      Upgrade to Plus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFB] rounded-xl border border-[#E2E8F0]">
            <Shield className="w-4 h-4 text-[#64748B] flex-shrink-0" />
            <p className="text-xs text-[#64748B]">
              All payments are securely processed by Stripe. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={plan}
      />
    </div>
  )
}
