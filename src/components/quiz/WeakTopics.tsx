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
    <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-orange-500/30 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Orb pose="teacher-pointer" size="md" />
        <div>
          <h3 className="text-2xl font-bold text-white">Weak Topics</h3>
          <p className="text-gray-400 text-sm">
            Focus on these areas to improve your score
          </p>
        </div>
      </div>

      {/* Weak Topics List */}
      <div className="space-y-4 mb-6">
        {weakTopics.map((topic) => (
          <div
            key={topic.topic}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">{topic.topic}</span>
              <span className="text-red-400 font-bold">
                {Math.round(topic.accuracy)}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${topic.accuracy}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              {topic.correct} / {topic.total} correct - Below 70% threshold
            </p>
          </div>
        ))}
      </div>

      {/* Study Button */}
      {onStudyWeakTopics && (
        <button
          onClick={handleStudyWeakTopics}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105"
        >
          Study Weak Topics with Flashcards
        </button>
      )}
    </div>
  )
}
