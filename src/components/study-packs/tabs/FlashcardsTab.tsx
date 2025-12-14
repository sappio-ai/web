'use client'

import { useState, useEffect } from 'react'
import FlashcardReview from '@/components/flashcards/FlashcardReview'
import DueQueue from '@/components/flashcards/DueQueue'
import TopicFilter from '@/components/flashcards/TopicFilter'
import ProgressChart from '@/components/flashcards/ProgressChart'
import StreakDisplay from '@/components/flashcards/StreakDisplay'
import ExportMenu from '@/components/exports/ExportMenu'
import Orb from '@/components/orb/Orb'
import GenerateMoreButton from '@/components/study-packs/GenerateMoreButton'
import UpgradePrompt from '@/components/paywall/UpgradePrompt'
import type { PlanLimits } from '@/lib/types/usage'

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
    const [cardCount, setCardCount] = useState<number>(0)
    const [limits, setLimits] = useState<PlanLimits | null>(null)

    const [generationStatus, setGenerationStatus] = useState<any>(null)

    // Fetch due cards count, card count, and plan limits
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                
                // Fetch study pack data (includes flashcards array with actual count)
                const packUrl = new URL(
                    `/api/study-packs/${packId}`,
                    window.location.origin
                )
                const packResponse = await fetch(packUrl.toString())
                if (packResponse.ok) {
                    const packData = await packResponse.json()
                    // Use actual flashcards array length for accurate count
                    setCardCount(packData.flashcards?.length || packData.stats?.cardCount || 0)
                    // Get generation status from stats
                    setGenerationStatus(packData.stats?.generationStatus?.flashcards)
                }
                
                // Fetch due count
                const dueUrl = new URL(
                    `/api/study-packs/${packId}/flashcards/due`,
                    window.location.origin
                )
                const dueResponse = await fetch(dueUrl.toString())
                if (dueResponse.ok) {
                    const dueData = await dueResponse.json()
                    setDueCount(dueData.count || 0)
                }
                
                // Fetch plan limits
                const limitsUrl = new URL(
                    `/api/user/usage`,
                    window.location.origin
                )
                const limitsResponse = await fetch(limitsUrl.toString())
                if (limitsResponse.ok) {
                    const limitsData = await limitsResponse.json()
                    setLimits(limitsData.limits)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
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

    const canGenerateMore = 
        limits?.batchCardsSize !== null && 
        limits?.batchCardsSize !== undefined &&
        cardCount < (limits?.cardsPerPack || 0)

    // Main flashcards tab view
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Progress Indicator and Export Button */}
            <div className="flex items-center justify-between">
                <div className="text-[14px] text-[#64748B]">
                    {isLoading || !limits ? (
                        <span className="inline-block w-24 h-4 bg-[#F1F5F9] rounded animate-pulse" />
                    ) : (
                        `${cardCount} / ${limits.cardsPerPack} flashcards`
                    )}
                </div>
                <ExportMenu
                    studyPackId={packId}
                    exportType="flashcards"
                    userPlan={userPlan}
                />
            </div>
            
            {/* Generate More Button (Paid Users) */}
            {canGenerateMore && limits && (
                <GenerateMoreButton
                    contentType="flashcards"
                    studyPackId={packId}
                    currentCount={cardCount}
                    maxLimit={limits.cardsPerPack}
                    batchSize={limits.batchCardsSize!}
                    userPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
                    generationStatus={generationStatus}
                    onGenerated={(newCount) => {
                        setCardCount(newCount)
                        setGenerationStatus({ status: 'completed' })
                        // Refresh due count after generating new cards (new cards are due immediately)
                        fetch(`/api/study-packs/${packId}/flashcards/due`)
                            .then(res => res.ok ? res.json() : null)
                            .then(data => data && setDueCount(data.count || 0))
                            .catch(console.error)
                    }}
                />
            )}
            
            {/* Upgrade Prompt (Free Users) */}
            {userPlan === 'free' && (
                <UpgradePrompt
                    featureName="Generate More Flashcards"
                    requiredPlan="student_pro"
                    benefits={[
                        'Generate up to 120 flashcards per pack',
                        'Add +30 cards at a time',
                        'Customize content depth',
                        'Priority processing'
                    ]}
                    currentPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
                />
            )}

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

