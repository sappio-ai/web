'use client'

import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'

interface TopicFilterProps {
  packId: string
  selectedTopic?: string
  onTopicChange: (topic: string | undefined) => void
}

interface TopicCount {
  topic: string
  totalCount: number
  dueCount: number
}

export default function TopicFilter({
  packId,
  selectedTopic,
  onTopicChange,
}: TopicFilterProps) {
  const [topics, setTopics] = useState<TopicCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/study-packs/${packId}/flashcards/topics`
        )
        if (response.ok) {
          const data = await response.json()
          setTopics(data.topics || [])
        }
      } catch (error) {
        console.error('Error fetching topics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [packId])

  if (isLoading || topics.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#64748B]" />
        <h3 className="text-[13px] font-semibold text-[#64748B] uppercase tracking-wide">
          Filter by Topic
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* All Topics Button */}
        <button
          onClick={() => onTopicChange(undefined)}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-[14px] ${
            !selectedTopic
              ? 'bg-[#5A5FF0] text-white shadow-sm'
              : 'bg-[#F8FAFB] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1D2E] border border-[#E2E8F0]'
          }`}
        >
          All Topics
        </button>

        {/* Topic Buttons */}
        {topics.map((topicData) => {
          const hasDueCards = topicData.dueCount > 0
          const isSelected = selectedTopic === topicData.topic

          return (
            <button
              key={topicData.topic}
              onClick={() => hasDueCards && onTopicChange(topicData.topic)}
              disabled={!hasDueCards}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-[14px] ${
                isSelected
                  ? 'bg-[#5A5FF0] text-white shadow-sm'
                  : hasDueCards
                    ? 'bg-[#F8FAFB] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1D2E] border border-[#E2E8F0]'
                    : 'bg-[#F8FAFB] text-[#94A3B8] opacity-50 cursor-not-allowed border border-[#E2E8F0]'
              }`}
            >
              {topicData.topic}{' '}
              <span className="text-[12px] opacity-75">
                {hasDueCards
                  ? `(${topicData.dueCount})`
                  : '(0 due)'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
