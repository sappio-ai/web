'use client'

import { Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface StudyRoomPromoProps {
  hasRooms: boolean
}

export default function StudyRoomPromo({ hasRooms }: StudyRoomPromoProps) {
  if (hasRooms) return null

  return (
    <div className="relative bg-gradient-to-br from-[#EEF2FF] to-[#F8FAFB] rounded-xl p-6 border border-[#5A5FF0]/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#5A5FF0]/10 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-[#5A5FF0]" />
        </div>
        <div className="flex-1">
          <h3 className="text-[16px] font-bold text-[#1A1D2E] mb-1">
            Study Better Together
          </h3>
          <p className="text-[14px] text-[#64748B] mb-3">
            Create a study room to study with friends. Share quizzes, track progress together, and stay accountable.
          </p>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#5A5FF0] hover:text-[#4A4FD0] transition-colors"
          >
            Create a Room
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
