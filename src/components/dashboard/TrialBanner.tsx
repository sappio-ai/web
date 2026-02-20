'use client'

import { useState } from 'react'
import { Clock, X } from 'lucide-react'
import { PaywallModal } from '@/components/paywall/PaywallModal'

interface TrialBannerProps {
  daysRemaining: number
  currentPlan?: string
}

export default function TrialBanner({ daysRemaining, currentPlan }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  if (dismissed) return null

  const progress = Math.max(0, Math.min(100, ((7 - daysRemaining) / 7) * 100))
  const isUrgent = daysRemaining <= 2

  return (
    <>
      <div className={`relative rounded-xl border p-4 mb-6 ${
        isUrgent
          ? 'bg-[#FEF3C7] border-[#F59E0B]/30'
          : 'bg-[#EFF6FF] border-[#5A5FF0]/20'
      }`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-[#94A3B8] hover:text-[#64748B] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-[#F59E0B]' : 'text-[#5A5FF0]'}`} />
          <p className="text-[14px] font-semibold text-[#1A1D2E]">
            Your Student Pro trial ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isUrgent ? 'bg-[#F59E0B]' : 'bg-[#5A5FF0]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={() => setShowPaywall(true)}
          className={`text-[13px] font-semibold transition-colors ${
            isUrgent
              ? 'text-[#D97706] hover:text-[#B45309]'
              : 'text-[#5A5FF0] hover:text-[#4A4FD0]'
          }`}
        >
          Upgrade Now →
        </button>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={currentPlan as any}
      />
    </>
  )
}
