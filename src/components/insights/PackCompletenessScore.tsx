'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, FileText, BookOpen, HelpCircle, Map } from 'lucide-react'
import { motion } from 'framer-motion'

interface PackCompletenessScoreProps {
  packId: string
}

interface CompletenessData {
  score: number
  items: {
    notes: boolean
    flashcards: boolean
    quiz: boolean
    mindmap: boolean
  }
}

export default function PackCompletenessScore({
  packId,
}: PackCompletenessScoreProps) {
  const [completeness, setCompleteness] = useState<CompletenessData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCompleteness()
  }, [packId])

  const fetchCompleteness = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/study-packs/${packId}/insights`)
      if (response.ok) {
        const data = await response.json()
        setCompleteness(data.completeness)
      }
    } catch (error) {
      console.error('Error fetching completeness:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="h-5 w-40 bg-[#F1F5F9] rounded animate-pulse mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F1F5F9] animate-pulse" />
            <div className="flex-1 h-3 bg-[#F1F5F9] rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!completeness) return null

  const items = [
    { key: 'notes', label: 'Notes', icon: FileText, color: 'text-[#5A5FF0]' },
    { key: 'flashcards', label: 'Flashcards', icon: BookOpen, color: 'text-[#22C55E]' },
    { key: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-[#F59E0B]' },
    { key: 'mindmap', label: 'Mind Map', icon: Map, color: 'text-[#8B5CF6]' },
  ]

  const completedCount = Object.values(completeness.items).filter(Boolean).length

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#1A1D2E]">Pack Completeness</h3>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#64748B] font-medium">{completedCount}/4</span>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5A5FF0]/10 to-[#22C55E]/10 border-2 border-[#5A5FF0]/30 flex items-center justify-center">
              <span className="text-[16px] font-black text-[#1A1D2E]">{completeness.score}%</span>
            </div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completeness.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#5A5FF0] via-[#22C55E] to-[#F59E0B]"
            />
          </div>
        </div>

        {/* Compact Items Row */}
        <div className="flex items-center justify-between gap-2">
          {items.map((item, index) => {
            const isComplete = completeness.items[item.key as keyof typeof completeness.items]
            const Icon = item.icon

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-1 group/item"
              >
                <div className={`relative p-3 rounded-lg border transition-all ${
                  isComplete
                    ? 'bg-[#F8FAFB] border-[#CBD5E1]'
                    : 'bg-[#F8FAFB]/50 border-[#E2E8F0]'
                }`}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative">
                      <Icon className={`w-4 h-4 ${isComplete ? item.color : 'text-[#94A3B8]'}`} />
                      {isComplete && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="w-3 h-3 text-[#10B981] fill-[#10B981]/20" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold ${
                      isComplete ? 'text-[#1A1D2E]' : 'text-[#94A3B8]'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
