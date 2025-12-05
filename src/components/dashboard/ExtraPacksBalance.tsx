'use client'

import { useEffect, useState } from 'react'
import { Package, Clock, AlertCircle, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import { QuotaExhaustedPaywall } from '@/components/paywall/QuotaExhaustedPaywall'

interface ExtraPacksBalanceProps {
  userId?: string
  userPlan?: 'free' | 'student_pro' | 'pro_plus'
}

interface UsageData {
  currentUsage: number
  monthlyRemaining: number
  monthlyLimit: number
  extraPacks: number
  periodStart: string
  periodEnd: string
  nearestExpiration?: string
  warning?: {
    count: number
    expiresAt: string
    daysRemaining: number
  }
}

const PLAN_NAMES = {
  free: 'Free',
  student_pro: 'Student Pro',
  pro_plus: 'Pro Plus',
}

const UPGRADE_TARGETS = {
  free: { name: 'Student Pro', packs: 60, price: '€7.99' },
  student_pro: { name: 'Pro Plus', packs: 300, price: '€14.99' },
  pro_plus: null,
}

export default function ExtraPacksBalance({ userId, userPlan = 'free' }: ExtraPacksBalanceProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showExtraPacksPaywall, setShowExtraPacksPaywall] = useState(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('purchase') === 'success') {
      setShowSuccess(true)
      // Remove the parameter from URL
      window.history.replaceState({}, '', window.location.pathname)
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)
    }

    const fetchData = async () => {
      try {
        // Fetch both extra packs and usage stats
        const [extraPacksRes, usageRes] = await Promise.all([
          fetch('/api/users/extra-packs'),
          fetch('/api/user/usage'),
        ])

        if (!extraPacksRes.ok || !usageRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const extraPacksData = await extraPacksRes.json()
        const usageData = await usageRes.json()

        setUsage({
          currentUsage: usageData.currentUsage || 0,
          monthlyRemaining: usageData.remaining || 0,
          monthlyLimit: usageData.limit || 0,
          extraPacks: extraPacksData.balance.total,
          periodStart: usageData.periodStart,
          periodEnd: usageData.periodEnd,
          nearestExpiration: extraPacksData.balance.nearestExpiration,
          warning: extraPacksData.warning,
        })
      } catch (err) {
        console.error('Error fetching usage data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="mb-8">
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)] border border-[#94A3B8]/30">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !usage) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const totalAvailable = Math.max(0, usage.monthlyRemaining) + usage.extraPacks

  return (
    <div className="mb-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 animate-in slide-in-from-top duration-300">
          <div className="relative">
            <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#10B981]/25" />
            <div className="relative bg-gradient-to-br from-[#ECFDF5] to-white rounded-xl p-5 shadow-[0_4px_16px_rgba(16,185,129,0.15)] border-2 border-[#10B981]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-[#1A1D2E] mb-1">
                    Purchase Successful!
                  </h3>
                  <p className="text-[14px] text-[#64748B]">
                    Your extra packs have been added to your account and are ready to use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Usage Card - Compact */}
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        
        <div className="relative bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#94A3B8]/30">
          {/* Bookmark Tab */}
          {usage.extraPacks > 0 && (
            <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#5A5FF0] rounded-b-[5px] shadow-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
            </div>
          )}

          {/* Header with icon */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Balance</p>
          </div>

          {/* Plan Context */}
          <div className="mb-4 pb-4 border-b border-[#E2E8F0]">
            <p className="text-[12px] text-[#64748B] mb-1">
              Plan: <span className="font-semibold text-[#1A1D2E]">{PLAN_NAMES[userPlan]}</span>
            </p>
            {UPGRADE_TARGETS[userPlan] && (
              <button
                onClick={() => setShowPaywall(true)}
                className="inline-flex items-center gap-1.5 text-[11px] text-[#5A5FF0] hover:text-[#4A4FD0] font-semibold transition-colors group"
              >
                <Sparkles className="w-3 h-3" />
                <span>Upgrade for {UPGRADE_TARGETS[userPlan]!.packs} packs/month + faster generation</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Monthly Packs */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-[#64748B]">Monthly Packs</span>
              <span className="text-[14px] font-bold text-[#1A1D2E]">
                {Math.min(usage.currentUsage, usage.monthlyLimit)} / {usage.monthlyLimit}
              </span>
            </div>
            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5A5FF0] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (usage.currentUsage / usage.monthlyLimit) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              {usage.monthlyRemaining > 0 
                ? `${usage.monthlyRemaining} remaining` 
                : 'All used'} • Resets {formatDate(usage.periodEnd)}
            </p>
          </div>

          {/* Grace/Bonus Pack Indicator */}
          {usage.currentUsage > usage.monthlyLimit && usage.extraPacks === 0 && (
            <div className="mb-3 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#EEF2FF] border border-[#5A5FF0]/30 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-[#5A5FF0]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#5A5FF0]">+1</span>
                </div>
                <p className="text-[11px] text-[#5A5FF0] font-semibold">
                  Bonus pack used (over monthly limit)
                </p>
              </div>
            </div>
          )}

          {/* Extra Packs */}
          <div className="mb-3 pt-3 border-t border-[#E2E8F0]">
            {usage.extraPacks > 0 ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-[#64748B]">Extra Packs</span>
                  <span className="text-[18px] font-bold text-[#5A5FF0]">{usage.extraPacks}</span>
                </div>
                {usage.nearestExpiration && (
                  <p className="text-[11px] text-[#94A3B8]">
                    Expires {formatDate(usage.nearestExpiration)}
                  </p>
                )}
              </>
            ) : (
              <div className="relative">
                {/* Paper stack effect */}
                <div className="absolute top-[2px] left-0 right-0 h-full bg-white/60 rounded-lg border border-[#5A5FF0]/20" />
                
                <div className="relative bg-gradient-to-br from-[#EEF2FF] to-white rounded-lg p-3 border border-[#5A5FF0]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                      <Package className="w-3.5 h-3.5 text-[#5A5FF0]" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-[#64748B]">Extra Packs</p>
                      <p className="text-[13px] font-bold text-[#1A1D2E]">None available</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExtraPacksPaywall(true)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-[#5A5FF0] to-[#7C3AED] hover:from-[#4A4FD0] hover:to-[#6D28D9] text-white text-[12px] font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] group"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buy Extra Packs</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <p className="text-[10px] text-[#64748B] text-center mt-2">
                    Roll over across months • Valid 6 months
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Usage hint */}
          <div className="pt-3 border-t border-[#E2E8F0]">
            <p className="text-[11px] text-[#94A3B8] italic">
              Uses monthly packs first, then extra packs
            </p>
          </div>

          {/* Warning if expiring soon */}
          {usage.warning && (
            <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-start gap-2 rounded-lg bg-[#FFFBEB] border border-[#FCD34D] p-3">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <div className="text-[13px] text-[#92400E]">
                  <span className="font-semibold">{usage.warning.count} packs</span> expire in{' '}
                  <span className="font-semibold">{usage.warning.daysRemaining} days</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={userPlan}
      />

      <QuotaExhaustedPaywall
        isOpen={showExtraPacksPaywall}
        onClose={() => setShowExtraPacksPaywall(false)}
        usage={usage ? {
          currentUsage: usage.currentUsage,
          remaining: usage.monthlyRemaining,
          limit: usage.monthlyLimit,
          periodStart: new Date(usage.periodStart),
          periodEnd: new Date(usage.periodEnd),
          percentUsed: (usage.currentUsage / usage.monthlyLimit) * 100,
          isAtLimit: usage.currentUsage >= usage.monthlyLimit,
          isNearLimit: usage.currentUsage >= usage.monthlyLimit * 0.8,
          hasGraceWindow: usage.currentUsage === usage.monthlyLimit,
          extraPacksAvailable: usage.extraPacks,
          totalAvailable: usage.monthlyRemaining + usage.extraPacks,
        } : undefined}
        currentPlan={userPlan}
      />
    </div>
  )
}
