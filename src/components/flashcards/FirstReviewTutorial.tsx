'use client'

import { useState, useEffect } from 'react'
import { X, RotateCcw, Brain } from 'lucide-react'
import Orb from '../orb/Orb'

const STORAGE_KEY = 'sappio_first_review_seen'

export default function FirstReviewTutorial() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-2xl p-8 max-w-lg mx-4 shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#1A1D2E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <Orb pose="flashcard-holding" size="lg" />
        </div>

        <h2 className="text-[24px] font-bold text-[#1A1D2E] text-center mb-4">
          How Spaced Repetition Works
        </h2>

        <div className="space-y-4 text-[15px] text-[#475569]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-4 h-4 text-[#5A5FF0]" />
            </div>
            <p>
              <span className="font-semibold text-[#1A1D2E]">Rate each card honestly.</span>{' '}
              Cards you struggle with will appear more often. Cards you know well will appear less.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw className="w-4 h-4 text-[#10B981]" />
            </div>
            <p>
              <span className="font-semibold text-[#1A1D2E]">Come back tomorrow.</span>{' '}
              The magic happens over time — reviewing at the right intervals moves knowledge into long-term memory.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#F8FAFB] rounded-xl border border-[#E2E8F0]">
          <p className="text-[13px] text-[#64748B] text-center">
            <span className="font-semibold text-[#F59E0B]">Again</span> = see it soon &nbsp;·&nbsp;
            <span className="font-semibold text-[#EF4444]">Hard</span> = see it tomorrow &nbsp;·&nbsp;
            <span className="font-semibold text-[#10B981]">Good</span> = standard interval &nbsp;·&nbsp;
            <span className="font-semibold text-[#5A5FF0]">Easy</span> = longer interval
          </p>
        </div>

        <button
          onClick={dismiss}
          className="w-full mt-6 px-6 py-3.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-xl transition-colors shadow-lg shadow-[#5A5FF0]/20"
        >
          Got it, let&apos;s start!
        </button>
      </div>
    </div>
  )
}
