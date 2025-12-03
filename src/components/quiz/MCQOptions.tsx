'use client'

import { useEffect } from 'react'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'

interface MCQOptionsProps {
  options: string[]
  selectedAnswer: string
  correctAnswer: string | null
  onSelect: (answer: string) => void
  disabled: boolean
}

export default function MCQOptions({
  options,
  selectedAnswer,
  correctAnswer,
  onSelect,
  disabled,
}: MCQOptionsProps) {
  // Keyboard shortcuts for options (1-4)
  useKeyboardShortcuts(
    !disabled
      ? {
        '1': () => options[0] && onSelect(options[0]),
        '2': () => options[1] && onSelect(options[1]),
        '3': () => options[2] && onSelect(options[2]),
        '4': () => options[3] && onSelect(options[3]),
      }
      : {}
  )

  const getOptionStyle = (option: string) => {
    if (!disabled) {
      // Before answering
      return option === selectedAnswer
        ? 'border-[#5A5FF0] bg-[#5A5FF0]/10'
        : 'border-[#CBD5E1] bg-[#F8FAFB] hover:bg-[#F1F5F9] hover:border-[#94A3B8]'
    }

    // After answering
    if (option === correctAnswer) {
      return 'border-[#10B981] bg-[#10B981]/10'
    }
    if (option === selectedAnswer && option !== correctAnswer) {
      return 'border-[#EF4444] bg-[#EF4444]/10'
    }
    return 'border-[#E2E8F0] bg-[#F8FAFB] opacity-50'
  }

  const getOptionIcon = (option: string) => {
    // Only show icons after answer is submitted (disabled = true)
    if (!disabled) {
      return null
    }

    // Show checkmark for correct answer
    if (option === correctAnswer) {
      return (
        <svg
          className="w-6 h-6 text-[#10B981]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )
    }

    return null
  }

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !disabled && onSelect(option)}
          disabled={disabled}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${getOptionStyle(
            option
          )} ${!disabled
            ? 'cursor-pointer'
            : 'cursor-not-allowed'
            }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5A5FF0]/10 flex items-center justify-center text-[#5A5FF0] font-bold text-[14px]">
              {index + 1}
            </span>
            <span className="text-[#1A1D2E] text-[15px]">{option}</span>
          </div>
          {getOptionIcon(option)}
        </button>
      ))}

      {!disabled && (
        <p className="text-[#64748B] text-[13px] text-center mt-4">
          Press 1-{options.length} to select an option
        </p>
      )}
    </div>
  )
}
