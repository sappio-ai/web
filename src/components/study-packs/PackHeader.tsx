'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Calendar, BarChart3, HelpCircle, Zap } from 'lucide-react'
import StreakDisplay from '../flashcards/StreakDisplay'

interface PackHeaderProps {
  pack: {
    id: string
    title: string
    summary: string | null
    createdAt: string
    material: {
      kind: string
      pageCount: number | null
    } | null
    stats: {
      coverage: number
      cardCount: number
      quizQuestionCount: number
      learningObjectives?: string[]
      tags?: string[]
    }
  }
  isDemo?: boolean
}

export default function PackHeader({ pack, isDemo = false }: PackHeaderProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleStartPractice = () => {
    router.push(`/study-packs/${pack.id}?tab=flashcards`)
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-[#10B981]'
    if (coverage >= 50) return 'text-[#F59E0B]'
    return 'text-[#EF4444]'
  }

  const getCoverageBg = (coverage: number) => {
    if (coverage >= 80) return 'bg-[#10B981]'
    if (coverage >= 50) return 'bg-[#F59E0B]'
    return 'bg-[#EF4444]'
  }

  return (
    <div className="mb-8 animate-in fade-in duration-700">
      {/* Back Button and Streak */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={isDemo ? "/signup" : "/dashboard"}
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1A1D2E] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[15px] font-medium">{isDemo ? "Sign up to create yours" : "Back to Dashboard"}</span>
        </Link>

        {!isDemo && <StreakDisplay variant="compact" />}
        {isDemo && (
          <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200">
            Demo Preview
          </div>
        )}
      </div>

      {/* Header Card - Paper Stack Style */}
      <div className="relative">
        {/* Paper stack layers */}
        <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />

        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
          {/* Bookmark Tab */}
          <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#5A5FF0] rounded-b-[5px] shadow-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[32px] font-bold text-[#1A1D2E] mb-4 break-words tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                {pack.title}
              </h1>

              {/* Learning Objectives */}
              {pack.stats.learningObjectives && pack.stats.learningObjectives.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[13px] font-semibold text-[#64748B] mb-2">What you&apos;ll learn:</h3>
                  <ul className="space-y-1.5">
                    {pack.stats.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-[14px] text-[#1A1D2E]">
                        <span className="text-[#5A5FF0] mt-1">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {pack.stats.tags && pack.stats.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  {pack.stats.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-[#5A5FF0]/10 border border-[#5A5FF0]/20 text-[13px] font-semibold text-[#5A5FF0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Start Practice CTA */}
              <button
                onClick={handleStartPractice}
                className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold text-[15px] transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
              >
                <Zap className="w-5 h-5" />
                Start Practice
              </button>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Flashcards */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#5A5FF0]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[24px] font-bold text-[#1A1D2E] leading-none">
                      {pack.stats.cardCount}
                    </p>
                    <p className="text-[12px] text-[#64748B] mt-0.5">Flashcards</p>
                  </div>
                </div>

                {/* Quiz Questions */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-[#5A5FF0]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[24px] font-bold text-[#1A1D2E] leading-none">
                      {pack.stats.quizQuestionCount}
                    </p>
                    <p className="text-[12px] text-[#64748B] mt-0.5">Questions</p>
                  </div>
                </div>

                {/* Coverage */}
                <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-[#5A5FF0]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className={`text-[20px] font-bold leading-none ${getCoverageColor(pack.stats.coverage)}`}>
                        {pack.stats.coverage}%
                      </p>
                      <p className="text-[11px] text-[#64748B]">Coverage</p>
                    </div>
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getCoverageBg(pack.stats.coverage)} transition-all duration-500`}
                        style={{ width: `${pack.stats.coverage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#64748B]/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#64748B]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1D2E] leading-none">
                      {formatDate(pack.createdAt)}
                    </p>
                    <p className="text-[12px] text-[#64748B] mt-0.5">Created</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

