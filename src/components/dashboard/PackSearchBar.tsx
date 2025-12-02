'use client'

import { Search, X } from 'lucide-react'

interface PackSearchBarProps {
  value: string
  onChange: (value: string) => void
  packCount: number
}

export default function PackSearchBar({
  value,
  onChange,
  packCount,
}: PackSearchBarProps) {
  return (
    <div className="relative">
      <div className="relative bg-white hover:bg-[#F8FAFB] rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Search Icon */}
          <Search className="w-5 h-5 text-[#64748B] flex-shrink-0" />

          {/* Search Input */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search study packs..."
            className="flex-1 bg-transparent text-[#1A1D2E] placeholder-[#94A3B8] outline-none text-sm"
            aria-label="Search study packs"
          />

          {/* Pack Count */}
          <span className="text-xs text-[#94A3B8] flex-shrink-0 font-medium">
            {packCount} {packCount === 1 ? 'pack' : 'packs'}
          </span>

          {/* Clear Button */}
          {value && (
            <button
              onClick={() => onChange('')}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-[#64748B] hover:text-[#1A1D2E] transition-colors" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
