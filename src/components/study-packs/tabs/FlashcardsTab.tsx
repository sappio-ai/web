'use client'

import { useState, useEffect } from 'react'
import FlashcardReview from '@/components/flashcards/FlashcardReview'
import DueQueue from '@/components/flashcards/DueQueue'
import TopicFilter from '@/components/flashcards/TopicFilter'
import ProgressChart from '@/components/flashcards/ProgressChart'
import StreakDisplay from '@/components/flashcards/StreakDisplay'
import ExportMenu from '@/components/exports/ExportMenu'
import Orb from '@/components/orb/Orb'

interface FlashcardsTabProps {
    packId: string
    userPlan?: string
}

export default function FlashcardsTab({ packId, userPlan = 'free' }: FlashcardsTabProps) {
    const [isReviewing, setIsReviewing] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
        undefined
    )
    const [dueCount, setDueCount] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch due cards count
    useEffect(() => {
        const fetchDueCount = async () => {
            try {
                setIsLoading(true)
                const url = new URL(
                    `/api/study-packs/${packId}/flashcards/due`,
                    window.location.origin
                )
                const response = await fetch(url.toString())
                if (response.ok) {
                    const data = await response.json()
                    setDueCount(data.count || 0)
                }
            } catch (error) {
                console.error('Error fetching due count:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDueCount()
    }, [packId])

    // If reviewing, show the review interface
    if (isReviewing) {
        return (
            <div className="animate-in fade-in duration-500">
                <FlashcardReview
                    packId={packId}
                    topicFilter={selectedTopic}
                    onComplete={() => setIsReviewing(false)}
                />
            </div>
        )
    }

    // Main flashcards tab view
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Export Button */}
            <div className="flex justify-end">
                <ExportMenu
                    studyPackId={packId}
                    exportType="flashcards"
                    userPlan={userPlan}
                />
            </div>

            {/* Streak Display */}
            <StreakDisplay />

            {/* Due Cards Section - Paper Card Style */}
            <div className="relative">
                {/* Paper stack layer */}
                <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />

                <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
                    {isLoading ? (
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <Orb pose="processing-thinking" size="md" />
                                <div className="flex-1">
                                    <div className="h-6 w-48 bg-[#F1F5F9] rounded animate-pulse mb-2" />
                                    <div className="h-4 w-64 bg-[#F1F5F9] rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="h-32 bg-[#F1F5F9] rounded-lg animate-pulse mb-4" />
                            <div className="h-12 w-full bg-[#F1F5F9] rounded-xl animate-pulse" />
                        </div>
                    ) : dueCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Orb pose="neutral" size="lg" />
                            <h3 className="text-[24px] font-bold text-[#1A1D2E] mt-4">
                                No cards due today!
                            </h3>
                            <p className="text-[15px] text-[#64748B] mt-2">
                                Come back tomorrow to continue your learning journey.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-[24px] font-bold text-[#1A1D2E] mb-2">
                                        Ready to Study
                                    </h2>
                                    <p className="text-[15px] text-[#64748B]">
                                        You have{' '}
                                        <span className="text-[#5A5FF0] font-bold">
                                            {dueCount} card{dueCount !== 1 ? 's' : ''}
                                        </span>{' '}
                                        due for review
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsReviewing(true)}
                                    className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2 shadow-sm"
                                >
                                    Start Review
                                </button>
                            </div>

                            {/* Topic Filter */}
                            <TopicFilter
                                packId={packId}
                                selectedTopic={selectedTopic}
                                onTopicChange={setSelectedTopic}
                            />

                            {/* Due Queue Preview */}
                            <DueQueue packId={packId} topicFilter={selectedTopic} />
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Chart */}
            <ProgressChart packId={packId} />
        </div>
    )
}

