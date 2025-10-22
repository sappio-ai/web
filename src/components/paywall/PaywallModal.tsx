'use client'

import { useEffect, useState } from 'react'
import { X, Check, Sparkles, Zap, Crown, Gift } from 'lucide-react'
import Orb from '@/components/orb/Orb'
import type { UsageStats } from '@/lib/types/usage'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  usage?: UsageStats
  trigger?: 'upload' | 'export' | 'bulk' | 'mindmap' | 'general'
}

const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: '€0',
    yearlyPrice: '€0',
    icon: Zap,
    features: [
      '3 packs per month',
      '25 cards per pack',
      '10-question quizzes',
      'Mini mind maps',
      'Limited exports',
    ],
  },
  student_pro: {
    name: 'Student Pro',
    monthlyPrice: '€7.99',
    yearlyPrice: '€79',
    semesterPrice: '€24',
    savingsText: 'Save €17/year',
    icon: Sparkles,
    features: [
      '300 packs per month',
      '300 cards per pack',
      '30-question quizzes',
      'Full mind maps',
      'Anki export',
      'Priority processing',
      'All export formats',
    ],
  },
  pro_plus: {
    name: 'Pro+',
    monthlyPrice: '€11.99',
    yearlyPrice: '€119',
    savingsText: 'Save €25/year',
    icon: Crown,
    features: [
      'Unlimited packs',
      'Unlimited cards',
      'Custom quiz blueprints',
      'Bulk upload',
      'Advanced mind maps',
      'API access',
      'Premium support',
    ],
  },
}

const MESSAGES = {
  upload: { title: "You've reached your monthly limit", orbPose: 'limit-reached' as const },
  export: { title: 'Unlock Anki Export', orbPose: 'upgrade-prompt' as const },
  bulk: { title: 'Bulk Upload Available', orbPose: 'upgrade-prompt' as const },
  mindmap: { title: 'Unlock Full Mind Maps', orbPose: 'upgrade-prompt' as const },
  general: { title: 'Upgrade Your Plan', orbPose: 'upgrade-prompt' as const },
}

export function PaywallModal({ isOpen, onClose, usage, trigger = 'general' }: PaywallModalProps) {
  const message = MESSAGES[trigger]
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose()
      }
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  const isOverLimit = usage && usage.currentUsage > usage.limit

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0A0F1A]/95 backdrop-blur-xl overflow-y-auto transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      onClick={handleClose}
    >
      <div className="min-h-screen flex items-start justify-center p-6 pt-12">
        <div
          className={`w-full max-w-6xl transition-all duration-300 ease-out ${isClosing
              ? 'opacity-0 scale-95 translate-y-4'
              : 'opacity-100 scale-100 translate-y-0'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#a8d5d5]/30 via-[#8bc5c5]/30 to-[#f5e6d3]/30 rounded-3xl blur-3xl opacity-40 pointer-events-none" />

          <div className="relative bg-gradient-to-br from-[#0D1420]/95 to-[#0A0F1A]/95 backdrop-blur-2xl rounded-2xl border border-[#a8d5d5]/20 shadow-2xl">
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#a8d5d5]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#f5e6d3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-8">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-6 top-6 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-3 bg-gradient-to-br from-[#a8d5d5]/20 to-[#8bc5c5]/20 rounded-full blur-2xl" />
                  <Orb pose={message.orbPose} size="lg" animated={true} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-white via-[#a8d5d5] to-white bg-clip-text text-transparent">
                      {message.title}
                    </span>
                  </h2>
                  {usage && (
                    <div className="inline-block w-full max-w-md">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/20">
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="text-gray-400">Monthly Usage</span>
                          <span className="text-white font-bold">{usage.currentUsage} / {usage.limit}</span>
                        </div>
                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] transition-all relative"
                            style={{ width: `${Math.min((usage.currentUsage / usage.limit) * 100, 100)}%` }}
                          >
                            {isOverLimit && <div className="absolute inset-0 bg-gradient-to-r from-[#f5e6d3] to-[#e5d6c3] animate-pulse" />}
                          </div>
                        </div>
                        {isOverLimit && (
                          <div className="mt-2 flex items-center gap-2 text-[#f5e6d3] text-sm">
                            <Gift className="w-4 h-4" />
                            <span>You got 1 bonus pack! Upgrade for unlimited access.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.08] border border-white/20">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${billingCycle === 'monthly'
                        ? 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all relative ${billingCycle === 'yearly'
                        ? 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Yearly
                    <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-[#f5e6d3] text-[#0a0e14] text-[10px] font-bold rounded-full">
                      Save
                    </span>
                  </button>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Free */}
                <div className="bg-white/[0.05] backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{PLANS.free.name}</h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-white">{PLANS.free.monthlyPrice}</span>
                        <span className="text-gray-400 text-xs">forever</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.free.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm">
                        <Check className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button disabled className="w-full py-3 bg-white/5 text-gray-400 font-semibold rounded-xl text-sm">
                    Current Plan
                  </button>
                </div>

                {/* Student Pro */}
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] rounded-full text-white text-xs font-bold z-10 shadow-lg whitespace-nowrap">
                    ⭐ Most Popular
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/40 to-[#8bc5c5]/40 rounded-xl blur-lg" />
                  <div className="relative bg-gradient-to-br from-[#a8d5d5]/15 to-[#8bc5c5]/15 backdrop-blur-xl rounded-xl p-6 border-2 border-[#a8d5d5]/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{PLANS.student_pro.name}</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold text-white">
                            {billingCycle === 'monthly' ? PLANS.student_pro.monthlyPrice : PLANS.student_pro.yearlyPrice}
                          </span>
                          <span className="text-gray-200 text-xs">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-[#a8d5d5] text-xs font-semibold mt-0.5">{PLANS.student_pro.savingsText}</p>
                        )}
                        {billingCycle === 'monthly' && (
                          <p className="text-[#a8d5d5] text-xs font-semibold mt-0.5">or {PLANS.student_pro.semesterPrice}/semester</p>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <ul className="space-y-2.5 mb-6">
                      {PLANS.student_pro.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-white text-sm">
                          <Check className="w-4 h-4 text-[#a8d5d5] flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white font-bold rounded-xl text-sm hover:scale-[1.02] transition-all shadow-lg">
                      Upgrade to Student Pro
                    </button>
                  </div>
                </div>

                {/* Pro+ */}
                <div className="bg-white/[0.05] backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-[#f5e6d3]/40 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{PLANS.pro_plus.name}</h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-white">
                          {billingCycle === 'monthly' ? PLANS.pro_plus.monthlyPrice : PLANS.pro_plus.yearlyPrice}
                        </span>
                        <span className="text-gray-400 text-xs">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-[#f5e6d3] text-xs font-semibold mt-0.5">{PLANS.pro_plus.savingsText}</p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5e6d3] to-[#e5d6c3] flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-[#0a0e14]" />
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.pro_plus.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm">
                        <Check className="w-4 h-4 text-[#f5e6d3] flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 bg-gradient-to-r from-[#f5e6d3] to-[#e5d6c3] text-[#0a0e14] font-bold rounded-xl text-sm hover:scale-[1.02] transition-all shadow-lg">
                    Upgrade to Pro+
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  ✨ All plans include secure storage, AI-powered generation, and mobile access
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Cancel anytime • No hidden fees • Student verification available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
