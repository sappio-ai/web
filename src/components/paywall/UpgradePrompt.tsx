'use client'

import { useState } from 'react'
import { Sparkles, Zap, ArrowRight } from 'lucide-react'
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
  const [isHovered, setIsHovered] = useState(false)

  const planName = requiredPlan === 'student_pro' ? 'Pro' : 'Pro+'
  const isProPlus = requiredPlan === 'pro_plus'

  return (
    <>
      <div className={`group relative overflow-hidden ${className}`}>
        {/* Animated gradient border */}
        <div
          className="absolute inset-0 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isProPlus
              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            padding: '1.5px',
          }}
        >
          <div className="absolute inset-[1.5px] bg-white rounded-[10px]" />
        </div>

        {/* Main content */}
        <button
          onClick={() => setShowPaywall(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-all duration-300 group-hover:scale-[1.005]"
        >
          {/* Left section: Icon + Text */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Animated icon container */}
            <div
              className={`relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''
                }`}
              style={{
                background: isProPlus
                  ? 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)'
                  : 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
              }}
            >
              {isProPlus ? (
                <Zap
                  className="w-5 h-5 text-orange-600 transition-all duration-300"
                  style={{ transform: isHovered ? 'translateY(-1px)' : 'none' }}
                />
              ) : (
                <Sparkles
                  className="w-5 h-5 text-indigo-600 transition-all duration-300"
                  style={{ transform: isHovered ? 'translateY(-1px)' : 'none' }}
                />
              )}

              {/* Subtle glow effect on hover */}
              <div
                className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${isHovered ? 'opacity-60' : 'opacity-0'
                  }`}
                style={{
                  background: isProPlus
                    ? 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />
            </div>

            {/* Text content */}
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#1A1D2E] truncate">
                Unlock {featureName}
              </p>
              <p className="text-[12px] text-[#64748B] truncate">
                {benefits[0]}
              </p>
            </div>
          </div>

          {/* Right section: CTA */}
          <div
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] text-white transition-all duration-300 ${isHovered ? 'gap-3' : ''
              }`}
            style={{
              background: isProPlus
                ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: isHovered
                ? isProPlus
                  ? '0 4px 20px rgba(249,115,22,0.4)'
                  : '0 4px 20px rgba(99,102,241,0.4)'
                : '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span>Upgrade to {planName}</span>
            <ArrowRight
              className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-0.5' : ''
                }`}
            />
          </div>
        </button>

        {/* Animated shimmer effect */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
          style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.5s' }}
        >
          <div
            className="absolute inset-0 -translate-x-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              animationDuration: '1.5s',
              animationIterationCount: 'infinite',
            }}
          />
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={currentPlan}
      />

      {/* Add shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </>
  )
}
