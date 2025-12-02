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
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
          <div className="h-5 w-40 bg-white/5 rounded animate-pulse mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />
            <div className="flex-1 h-3 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!completeness) return null

  const items = [
    { key: 'notes', label: 'Notes', icon: FileText, color: 'text-[#a8d5d5]' },
    { key: 'flashcards', label: 'Flashcards', icon: BookOpen, color: 'text-blue-400' },
    { key: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-purple-400' },
    { key: 'mindmap', label: 'Mind Map', icon: Map, color: 'text-green-400' },
  ]

  const completedCount = Object.values(completeness.items).filter(Boolean).length

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Pack Completeness</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{completedCount}/4</span>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a8d5d5]/20 to-[#8bc5c5]/20 border border-[#a8d5d5]/30 flex items-center justify-center">
              <span className="text-lg font-black text-white">{completeness.score}%</span>
            </div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completeness.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#a8d5d5] via-blue-400 to-purple-400"
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
                    ? 'bg-white/[0.05] border-white/20'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative">
                      <Icon className={`w-4 h-4 ${isComplete ? item.color : 'text-gray-600'}`} />
                      {isComplete && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="w-3 h-3 text-green-400 fill-green-400/20" />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      isComplete ? 'text-white' : 'text-gray-500'
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
