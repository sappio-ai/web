'use client'

import type { TopicPerformance } from '@/lib/types/quiz'
import Orb from '../orb/Orb'

interface WeakTopicsProps {
  topicPerformance: Record<string, TopicPerformance>
  onStudyWeakTopics?: (topics: string[]) => void
}

export default function WeakTopics({
  topicPerformance,
  onStudyWeakTopics,
}: WeakTopicsProps) {
  const weakTopics = Object.values(topicPerformance).filter((t) => t.isWeak)

  if (weakTopics.length === 0) {
    return null
  }

  const handleStudyWeakTopics = () => {
    if (onStudyWeakTopics) {
      onStudyWeakTopics(weakTopics.map((t) => t.topic))
    }
  }

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#F59E0B]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#F59E0B]/50">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Orb pose="teacher-pointer" size="md" />
          <div>
            <h3 className="text-[24px] font-bold text-[#1A1D2E]">Weak Topics</h3>
            <p className="text-[#64748B] text-[14px]">
              Focus on these areas to improve your score
            </p>
          </div>
        </div>

        {/* Weak Topics List */}
        <div className="space-y-4 mb-6">
          {weakTopics.map((topic) => (
            <div
              key={topic.topic}
              className="bg-[#EF4444]/5 border border-[#EF4444]/30 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#1A1D2E] font-medium text-[15px]">{topic.topic}</span>
                <span className="text-[#EF4444] font-bold text-[16px]">
                  {Math.round(topic.accuracy)}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#EF4444] transition-all"
                  style={{ width: `${topic.accuracy}%` }}
                />
              </div>
              <p className="text-[#64748B] text-[13px]">
                {topic.correct} / {topic.total} correct - Below 70% threshold
              </p>
            </div>
          ))}
        </div>

        {/* Study Button */}
        {onStudyWeakTopics && (
          <button
            onClick={handleStudyWeakTopics}
            className="w-full px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 shadow-sm"
          >
            Study Weak Topics with Flashcards
          </button>
        )}
      </div>
    </div>
  )
}
