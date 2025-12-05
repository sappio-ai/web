'use client'

import Link from 'next/link'
import { BookOpen, Flame } from 'lucide-react'

interface ContinuePanelProps {
  lastPackId?: string
  lastPackTitle?: string
  dueCountInPack: number
}

export default function ContinuePanel({ lastPackId, lastPackTitle, dueCountInPack }: ContinuePanelProps) {
  if (!lastPackId || !lastPackTitle || dueCountInPack === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />
        
        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#F59E0B]/30">
          {/* Bookmark Tab */}
          <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#F59E0B] rounded-b-[5px] shadow-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#D97706] rounded-t-sm" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-[14px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Continue Learning
                </h3>
              </div>
              <h2 className="text-[20px] font-bold text-[#1A1D2E] mb-1 line-clamp-1">
                {lastPackTitle}
              </h2>
              <p className="text-[14px] text-[#64748B]">
                <span className="font-semibold text-[#F59E0B]">{dueCountInPack} card{dueCountInPack !== 1 ? 's' : ''}</span> due in this pack
              </p>
            </div>
            <Link
              href={`/study-packs/${lastPackId}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-[15px] font-bold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <Flame className="w-5 h-5" />
              <span>Review {lastPackTitle.length > 20 ? 'Pack' : lastPackTitle}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
