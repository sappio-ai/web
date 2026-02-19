'use client'

import { useEffect } from 'react'
import BadgeIcon from './BadgeIcon'

interface LevelUpToastProps {
  level: number
  badgeName?: string
  badgeIcon?: string
  badgeColor?: string
  onClose: () => void
}

export default function LevelUpToast({ level, badgeName, badgeIcon, badgeColor, onClose }: LevelUpToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-toast-in">
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl p-4 flex items-center gap-3 max-w-sm">
        {badgeName && badgeIcon && badgeColor ? (
          <BadgeIcon iconName={badgeIcon} color={badgeColor} earned size="md" />
        ) : (
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#5A5FF0] flex items-center justify-center shadow-sm">
            <span className="text-white text-lg font-bold">{level}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1D2E]">
            {badgeName ? 'Badge Earned!' : 'Level Up!'}
          </p>
          <p className="text-xs text-[#64748B]">
            {badgeName
              ? `You unlocked "${badgeName}"`
              : `You reached Level ${level}!`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-[#94A3B8] hover:text-[#1A1D2E] transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <style jsx>{`
        @keyframes toastIn {
          0% { opacity: 0; transform: translateY(16px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in {
          animation: toastIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
