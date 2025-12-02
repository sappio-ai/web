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
        ? 'border-[#a8d5d5] bg-[#a8d5d5]/10'
        : 'border-white/20 bg-white/5 hover:bg-white/10'
    }

    // After answering
    if (option === correctAnswer) {
      return 'border-green-500 bg-green-500/10'
    }
    if (option === selectedAnswer && option !== correctAnswer) {
      return 'border-red-500 bg-red-500/10'
    }
    return 'border-white/20 bg-white/5 opacity-50'
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
          className="w-6 h-6 text-green-400"
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
            ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            : 'cursor-not-allowed'
            }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </span>
            <span className="text-white">{option}</span>
          </div>
          {getOptionIcon(option)}
        </button>
      ))}

      {!disabled && (
        <p className="text-gray-400 text-sm text-center mt-4">
          Press 1-{options.length} to select an option
        </p>
      )}
    </div>
  )
}
