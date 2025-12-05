'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { PaywallModal } from '@/components/paywall/PaywallModal'

interface PlanBadgeProps {
  plan: 'free' | 'student_pro' | 'pro_plus'
}

const PLAN_LABELS = {
  free: 'Free',
  student_pro: 'Student Pro',
  pro_plus: 'Pro Plus',
}

const PLAN_STYLES = {
  free: 'bg-[#F1F5F9] text-[#64748B] border-transparent',
  student_pro: 'bg-gradient-to-r from-[#5A5FF0]/10 to-[#7C3AED]/10 text-[#5A5FF0] border-[#5A5FF0]/30',
  pro_plus: 'bg-gradient-to-r from-[#1A1D2E] to-[#2A2D3E] text-white border-[#5A5FF0]/50 shadow-sm',
}

export default function PlanBadge({ plan }: PlanBadgeProps) {
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <span className={`px-2.5 py-1 text-[12px] font-bold rounded-md uppercase tracking-wide border ${PLAN_STYLES[plan]} ${plan === 'pro_plus' ? 'flex items-center gap-1.5' : ''}`}>
          {plan === 'pro_plus' && <Sparkles className="w-3 h-3" />}
          {PLAN_LABELS[plan]}
        </span>
        {plan !== 'pro_plus' && (
          <button
            onClick={() => setShowPaywall(true)}
            className="px-3 py-1.5 bg-[#1A1D2E] hover:bg-[#2A2D3E] text-white text-[12px] font-bold rounded-md transition-all duration-150 flex items-center gap-1.5 shadow-sm border border-[#5A5FF0]/20 hover:border-[#5A5FF0]/40 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#5A5FF0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-3 h-3 relative z-10" />
            <span className="relative z-10">Upgrade</span>
          </button>
        )}
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={plan}
      />
    </>
  )
}
