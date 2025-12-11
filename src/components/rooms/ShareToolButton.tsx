'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolType } from '@/lib/types/rooms'

interface ShareToolButtonProps {
  onSelectType: (type: ToolType) => void
  disabled?: boolean
}

const toolOptions: { type: ToolType; icon: string; label: string }[] = [
  { type: 'quiz', icon: '📝', label: 'Quiz' },
  { type: 'flashcards', icon: '🃏', label: 'Flashcards' },
  { type: 'notes', icon: '📄', label: 'Notes' },
]

export default function ShareToolButton({ onSelectType, disabled = false }: ShareToolButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (type: ToolType) => {
    setIsOpen(false)
    onSelectType(type)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Share Tool"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-2">
            <p className="px-3 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider">
              Share Tool
            </p>
            {toolOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleSelect(option.type)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
