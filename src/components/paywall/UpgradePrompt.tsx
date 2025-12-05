'use client'

import { useState } from 'react'
import { Crown, Sparkles } from 'lucide-react'
import { PaywallModal } from './PaywallModal'

interface UpgradePromptProps {
  featureName: string
  requiredPlan: 'student_pro' | 'pro_plus'
  benefits: string[]
  className?: string
  currentPlan?: 'free' | 'student_pro' | 'pro_plus'
}

export default function UpgradePrompt({
  featureName,
  requiredPlan,
  benefits,
  className = '',
  currentPlan = 'free',
}: UpgradePromptProps) {
  const [showPaywall, setShowPaywall] = useState(false)

  const planName = requiredPlan === 'student_pro' ? 'Student Pro' : 'Pro'
  const icon = requiredPlan === 'student_pro' ? Sparkles : Crown
  const iconColor = requiredPlan === 'student_pro' ? 'text-blue-600' : 'text-orange-500'
  const bgColor = requiredPlan === 'student_pro' ? 'bg-blue-50' : 'bg-orange-50'
  const borderColor = requiredPlan === 'student_pro' ? 'border-blue-200' : 'border-orange-200'
  const buttonColor = requiredPlan === 'student_pro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'

  const Icon = icon

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className={`relative ${bgColor} rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border-2 ${borderColor}`}>
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center mb-4 border-2 ${borderColor}`}>
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            
            <h3 className="text-[20px] font-bold text-[#1A1D2E] mb-2">
              {featureName}
            </h3>
            
            <p className="text-[#64748B] text-[14px] mb-6 max-w-md">
              Unlock {featureName.toLowerCase()} with {planName}
            </p>

            <div className="w-full max-w-md mb-6">
              <ul className="space-y-2 text-left">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-[#1A1D2E] text-[14px]">
                    <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowPaywall(true)}
              className={`${buttonColor} text-white px-6 py-3 rounded-lg font-semibold text-[14px] transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2`}
            >
              <span>Upgrade to {planName}</span>
              <Icon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={currentPlan}
      />
    </>
  )
}
