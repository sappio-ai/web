'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUpDown, Clock, Type, Flame, TrendingUp, Check } from 'lucide-react'

interface PackSortDropdownProps {
  activeSort: 'updated' | 'alphabetical' | 'due_cards' | 'progress'
  onChange: (sort: 'updated' | 'alphabetical' | 'due_cards' | 'progress') => void
}

const sortOptions = [
  {
    value: 'updated' as const,
    label: 'Recently Updated',
    icon: Clock,
    description: 'Most recently modified',
  },
  {
    value: 'alphabetical' as const,
    label: 'Alphabetical',
    icon: Type,
    description: 'A to Z by title',
  },
  {
    value: 'due_cards' as const,
    label: 'Most Due Cards',
    icon: Flame,
    description: 'Highest review priority',
  },
  {
    value: 'progress' as const,
    label: 'Progress',
    icon: TrendingUp,
    description: 'Highest completion',
  },
]

export default function PackSortDropdown({
  activeSort,
  onChange,
}: PackSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeOption = sortOptions.find((opt) => opt.value === activeSort)

  // Load sort preference from localStorage on mount
  useEffect(() => {
    const savedSort = localStorage.getItem('packSort')
    if (savedSort && ['updated', 'alphabetical', 'due_cards', 'progress'].includes(savedSort)) {
      onChange(savedSort as any)
    }
  }, [])

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

  const handleSortChange = (sort: 'updated' | 'alphabetical' | 'due_cards' | 'progress') => {
    onChange(sort)
    localStorage.setItem('packSort', sort)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sort Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
        aria-label="Sort study packs"
        aria-expanded={isOpen}
      >
        <div className="relative bg-white hover:bg-[#F8FAFB] rounded-xl px-4 py-3 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex items-center gap-3">
          <ArrowUpDown className="w-5 h-5 text-[#5A5FF0]" />
          <span className="text-sm font-semibold text-[#1A1D2E]">
            {activeOption?.label}
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-lg overflow-hidden">
            {sortOptions.map((option) => {
              const Icon = option.icon
              const isActive = option.value === activeSort

              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
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
                  {isActive && (
                    <Check className="w-4 h-4 text-[#5A5FF0]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
