'use client'

import { useState } from 'react'
import Orb from '../orb/Orb'
import { PaywallModal } from '../paywall/PaywallModal'
import { Crown } from 'lucide-react'

interface ModeSelectorProps {
  onSelectMode: (mode: 'practice' | 'timed') => void
  userPlan?: string
}

export default function ModeSelector({ onSelectMode, userPlan = 'free' }: ModeSelectorProps) {
  const [showPaywall, setShowPaywall] = useState(false)
  
  const canUseTimedMode = userPlan !== 'free'

  const handleTimedModeClick = () => {
    if (canUseTimedMode) {
      onSelectMode('timed')
    } else {
      setShowPaywall(true)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center max-w-4xl mx-auto">
        {/* Quiz Master Orb */}
        <div className="mb-6">
          <Orb pose="quiz-master" size="lg" />
        </div>

        {/* Title */}
        <h2 className="text-[32px] font-bold text-[#1A1D2E] mb-3">Choose Quiz Mode</h2>
        <p className="text-[#64748B] text-center mb-8 max-w-md text-[15px]">
          Select how you&apos;d like to take this quiz
        </p>

        {/* Mode Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Practice Mode */}
          <button
            onClick={() => onSelectMode('practice')}
            className="group relative"
          >
            <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
            <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] hover:border-[#5A5FF0]/50 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center mb-4 group-hover:bg-[#5A5FF0]/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-[#5A5FF0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-[20px] font-bold text-[#1A1D2E] mb-2">Practice Mode</h3>
                <p className="text-[#64748B] text-[14px]">
                  Take your time to learn. No timer, no pressure. Perfect for
                  studying and understanding concepts.
                </p>
              </div>
            </div>
          </button>

          {/* Timed Mode */}
          <button
            onClick={handleTimedModeClick}
            className="group relative"
          >
            <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
            <div className={`relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] transition-all ${
              canUseTimedMode 
                ? 'hover:border-[#F59E0B]/50 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)]' 
                : 'opacity-60 hover:opacity-70 cursor-pointer'
            }`}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                  canUseTimedMode 
                    ? 'bg-[#F59E0B]/10 group-hover:bg-[#F59E0B]/20' 
                    : 'bg-[#94A3B8]/10'
                }`}>
                  <svg
                    className={`w-8 h-8 ${canUseTimedMode ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[20px] font-bold text-[#1A1D2E]">Timed Mode</h3>
                  {!canUseTimedMode && (
                    <Crown className="w-5 h-5 text-[#F59E0B]" />
                  )}
                </div>
                <p className="text-[#64748B] text-[14px]">
                  Simulate exam conditions with a countdown timer. 2 minutes per
                  question. Test your knowledge under pressure.
                </p>
                {!canUseTimedMode && (
                  <div className="mt-4 px-4 py-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg">
                    <p className="text-[#F59E0B] text-[13px] font-medium">
                      Student or Pro plan required
                    </p>
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="general"
        currentPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
      />
    </>
  )
}
