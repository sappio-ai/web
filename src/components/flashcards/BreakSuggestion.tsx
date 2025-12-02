'use client'

import Orb from '../orb/Orb'

interface BreakSuggestionProps {
  onTakeBreak: () => void
  onContinue: () => void
  onDisable: () => void
}

export default function BreakSuggestion({
  onTakeBreak,
  onContinue,
  onDisable,
}: BreakSuggestionProps) {
  return (
    <div className="fixed inset-0 bg-[#1A1D2E]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        {/* Paper stack backing */}
        <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#CBD5E1]/40" />
        
        {/* Main modal card */}
        <div className="relative bg-white rounded-xl p-8 shadow-[0_4px_24px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)] border border-[#E2E8F0]">
          {/* Neutral Orb */}
          <div className="flex justify-center mb-6">
            <Orb pose="neutral" size="lg" />
          </div>

          {/* Message */}
          <h3 className="text-[24px] font-bold text-[#1A1D2E] text-center mb-3">
            Time for a Break?
          </h3>
          <p className="text-[#475569] text-center mb-6 text-[15px] leading-relaxed">
            You&apos;ve been studying hard! Taking a short break can help improve focus
            and retention.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onTakeBreak}
              className="w-full px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold rounded-lg transition-colors shadow-sm text-[15px]"
            >
              Take a 5-Minute Break
            </button>

            <button
              onClick={onContinue}
              className="w-full px-6 py-3 bg-[#F8FAFB] hover:bg-[#F1F5F9] text-[#1A1D2E] font-medium rounded-lg transition-colors border border-[#E2E8F0] text-[15px]"
            >
              Continue Studying
            </button>

            <button
              onClick={onDisable}
              className="w-full px-4 py-2 text-[#64748B] text-[13px] hover:text-[#1A1D2E] transition-colors"
            >
              Don&apos;t show this again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
