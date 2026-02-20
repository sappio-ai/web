'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle, Check, Lock } from 'lucide-react'
import { PaywallModal } from './PaywallModal'

interface TrialExpiredModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
}

const LOST_FEATURES = [
  'Unlimited study packs',
  'Advanced quizzes (30+ questions)',
  'Mind maps with 200+ nodes',
  'PDF & Markdown exports',
  'Priority AI generation',
]

const KEPT_FEATURES = [
  '5 packs per month',
  '40 cards per pack',
  'Basic quizzes',
  'Basic mind maps',
]

export default function TrialExpiredModal({ isOpen, onClose, currentPlan }: TrialExpiredModalProps) {
  const [showPaywall, setShowPaywall] = useState(false)

  if (!isOpen) return null

  const handleUpgrade = () => {
    setShowPaywall(true)
  }

  if (showPaywall) {
    return (
      <PaywallModal
        isOpen={true}
        onClose={() => {
          setShowPaywall(false)
          onClose()
        }}
        trigger="general"
        currentPlan={currentPlan as any}
      />
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#64748B] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <h2 className="text-[22px] font-bold text-[#1A1D2E] mb-2">
            Your Trial Has Ended
          </h2>
          <p className="text-[14px] text-[#64748B]">
            Your Student Pro trial has expired. Upgrade to keep your premium features.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[12px] font-semibold text-[#EF4444] uppercase tracking-wide mb-2 flex items-center gap-1">
              <Lock className="w-3 h-3" /> You lose
            </p>
            <ul className="space-y-1.5">
              {LOST_FEATURES.map(f => (
                <li key={f} className="text-[12px] text-[#94A3B8] flex items-start gap-1.5">
                  <X className="w-3 h-3 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#10B981] uppercase tracking-wide mb-2 flex items-center gap-1">
              <Check className="w-3 h-3" /> You keep
            </p>
            <ul className="space-y-1.5">
              {KEPT_FEATURES.map(f => (
                <li key={f} className="text-[12px] text-[#64748B] flex items-start gap-1.5">
                  <Check className="w-3 h-3 text-[#10B981] mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold rounded-lg text-[15px] transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          Upgrade Now
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 mt-2 text-[13px] text-[#94A3B8] hover:text-[#64748B] transition-colors"
        >
          Continue with Free plan
        </button>
      </div>
    </div>,
    document.body
  )
}
