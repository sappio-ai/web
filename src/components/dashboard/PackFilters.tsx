'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, Clock, Calendar, Target, Check } from 'lucide-react'

interface PackFiltersProps {
  activeFilter: 'all' | 'has_due' | 'recent' | 'needs_review'
  onChange: (filter: 'all' | 'has_due' | 'recent' | 'needs_review') => void
  counts: {
    all: number
    has_due: number
    recent: number
    needs_review: number
  }
}

const filterOptions = [
  {
    value: 'all' as const,
    label: 'All Packs',
    icon: Filter,
    description: 'Show all study packs',
  },
  {
    value: 'has_due' as const,
    label: 'Has Due Cards',
    icon: Clock,
    description: 'Packs with cards to review',
  },
  {
    value: 'recent' as const,
    label: 'Recently Updated',
    icon: Calendar,
    description: 'Updated in last 7 days',
  },
  {
    value: 'needs_review' as const,
    label: 'Needs Review',
    icon: Target,
    description: 'Progress below 50%',
  },
]

export default function PackFilters({
  activeFilter,
  onChange,
  counts,
}: PackFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeOption = filterOptions.find((opt) => opt.value === activeFilter)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
        aria-label="Filter study packs"
        aria-expanded={isOpen}
      >
        <div className="relative bg-white hover:bg-[#F8FAFB] rounded-xl px-4 py-3 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex items-center gap-3">
          {activeOption && <activeOption.icon className="w-5 h-5 text-[#5A5FF0]" />}
          <span className="text-sm font-semibold text-[#1A1D2E]">
            {activeOption?.label}
          </span>
          <div className="px-2 py-0.5 rounded-full bg-[#5A5FF0]/10 text-[#5A5FF0] text-xs font-bold">
            {counts[activeFilter]}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-lg overflow-hidden">
            {filterOptions.map((option) => {
              const Icon = option.icon
              const isActive = option.value === activeFilter
              const count = counts[option.value]

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-[#5A5FF0]/10'
                      : 'hover:bg-[#F8FAFB]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-[#5A5FF0]' : 'text-[#64748B]'
                    }`}
                  />
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? 'text-[#1A1D2E]' : 'text-[#1A1D2E]'
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                      {option.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-[#5A5FF0]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {count}
                    </span>
                    {isActive && (
                      <Check className="w-4 h-4 text-[#5A5FF0]" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
