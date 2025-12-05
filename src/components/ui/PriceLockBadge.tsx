/**
 * PriceLockBadge
 * 
 * Displays a badge indicating founding price lock status
 */

import { formatDate } from '@/lib/utils/benefits'

interface PriceLockBadgeProps {
  expiresAt: string
  className?: string
}

export default function PriceLockBadge({ expiresAt, className = '' }: PriceLockBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg ${className}`}>
      <svg 
        className="w-4 h-4 text-[var(--accent)]" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-[var(--accent)]">
          Founding Price Lock
        </span>
        <span className="text-[10px] text-[var(--text)]">
          Until {formatDate(expiresAt)}
        </span>
      </div>
    </div>
  )
}
