'use client'

import Link from 'next/link'
import { BookOpen, Flame } from 'lucide-react'

interface DuePack {
  id: string
  title: string
  dueCount: number
}

interface ContinuePanelProps {
  packs: DuePack[]
}

export default function ContinuePanel({ packs }: ContinuePanelProps) {
  if (!packs || packs.length === 0) {
    return null
  }

  // Single pack — original layout
  if (packs.length === 1) {
    const pack = packs[0]
    return (
      <div className="mb-8">
        <div className="relative">
          <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />

          <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#F59E0B]/30">
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
                  {pack.title}
                </h2>
                <p className="text-[14px] text-[#64748B]">
                  <span className="font-semibold text-[#F59E0B]">{pack.dueCount} card{pack.dueCount !== 1 ? 's' : ''}</span> due in this pack
                </p>
              </div>
              <Link
                href={`/study-packs/${pack.id}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-[15px] font-bold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <Flame className="w-5 h-5" />
                <span>Review {pack.title.length > 20 ? 'Pack' : pack.title}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Multiple packs with due cards
  const totalDue = packs.reduce((sum, p) => sum + p.dueCount, 0)

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />

        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#F59E0B]/30">
          <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#F59E0B] rounded-b-[5px] shadow-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#D97706] rounded-t-sm" />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-[14px] font-semibold text-[#64748B] uppercase tracking-wider">
              Continue Learning
            </h3>
            <span className="ml-auto text-[13px] font-semibold text-[#F59E0B]">
              {totalDue} cards due total
            </span>
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {packs.map((pack) => (
              <Link
                key={pack.id}
                href={`/study-packs/${pack.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#FEF3C7]/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#1A1D2E] truncate group-hover:text-[#D97706] transition-colors">
                    {pack.title}
                  </p>
                  <p className="text-[13px] text-[#64748B]">
                    <span className="font-semibold text-[#F59E0B]">{pack.dueCount}</span> card{pack.dueCount !== 1 ? 's' : ''} due
                  </p>
                </div>
                <div className="ml-3 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0">
                  <Flame className="w-4 h-4" />
                  Review
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
