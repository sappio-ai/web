'use client'

import { useState, useMemo, useEffect } from 'react'
import CreatePackModal from '@/components/materials/CreatePackModal'
import StreakDisplay from '@/components/flashcards/StreakDisplay'
import PackSearchBar from '@/components/dashboard/PackSearchBar'
import PackFilters from '@/components/dashboard/PackFilters'
import PackSortDropdown from '@/components/dashboard/PackSortDropdown'
import ExtraPacksBalance from '@/components/dashboard/ExtraPacksBalance'
import ContinuePanel from '@/components/dashboard/ContinuePanel'
import Orb from '@/components/orb/Orb'
import { useOrb } from '@/lib/contexts/OrbContext'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import { Package, BookOpen, Target, TrendingUp, Clock, Flame, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useRouter } from 'next/navigation'

interface DashboardClientProps {
    userData: any
    studyPacks: any[]
    dashboardData: {
        dueCount: number
        packsWithDueCards: number
        masteredCount: number
        avgAccuracy: number
        hasQuizResults: boolean
        totalPacks: number
        materialsCount: number
        quizResultsCount: number
    }
}

export default function DashboardClient({
    userData,
    studyPacks,
    dashboardData,
}: DashboardClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'has_due' | 'recent' | 'needs_review'>('all')
    const [activeSort, setActiveSort] = useState<'updated' | 'alphabetical' | 'due_cards' | 'progress'>('updated')
    const { getWelcomeOrb } = useOrb()
    
    const { dueCount, packsWithDueCards, masteredCount, avgAccuracy, hasQuizResults } = dashboardData
    
    // Get time-based welcome Orb
    const welcomeOrb = getWelcomeOrb()
    const welcomeGreeting = welcomeOrb === 'welcome-back-morning' ? 'Good morning' : 
                           welcomeOrb === 'welcome-back-afternoon' ? 'Good afternoon' : 
                           'Good evening'

    // Debounce search query
    const debouncedSearch = useDebounce(searchQuery, 300)

    // Track search events
    useEffect(() => {
        if (debouncedSearch) {
            AnalyticsService.trackPackSearched(debouncedSearch)
        }
    }, [debouncedSearch])

    // Track filter events
    useEffect(() => {
        if (activeFilter !== 'all') {
            AnalyticsService.trackPackFiltered(activeFilter)
        }
    }, [activeFilter])

    // Track sort events
    useEffect(() => {
        AnalyticsService.trackPackSorted(activeSort)
    }, [activeSort])

    // Filter and sort packs
    const filteredAndSortedPacks = useMemo(() => {
        let filtered = [...studyPacks]

        // Apply search filter
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase()
            filtered = filtered.filter(
                (pack) =>
                    pack.title.toLowerCase().includes(query) ||
                    pack.summary?.toLowerCase().includes(query)
            )
        }

        // Apply category filter
        if (activeFilter === 'has_due') {
            filtered = filtered.filter((pack) => pack.dueCount > 0)
        } else if (activeFilter === 'recent') {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            filtered = filtered.filter(
                (pack) => new Date(pack.updated_at) >= sevenDaysAgo
            )
        } else if (activeFilter === 'needs_review') {
            filtered = filtered.filter(
                (pack) => (pack.stats_json?.progress || 0) < 50
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (activeSort) {
                case 'alphabetical':
                    return a.title.localeCompare(b.title)
                case 'due_cards':
                    return b.dueCount - a.dueCount
                case 'progress':
                    return (b.stats_json?.progress || 0) - (a.stats_json?.progress || 0)
                case 'updated':
                default:
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            }
        })

        return filtered
    }, [studyPacks, debouncedSearch, activeFilter, activeSort])

    // Calculate filter counts
    const filterCounts = useMemo(() => {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        return {
            all: studyPacks.length,
            has_due: studyPacks.filter((pack) => pack.dueCount > 0).length,
            recent: studyPacks.filter(
                (pack) => new Date(pack.updated_at) >= sevenDaysAgo
            ).length,
            needs_review: studyPacks.filter(
                (pack) => (pack.stats_json?.progress || 0) < 50
            ).length,
        }
    }, [studyPacks])

    const hasPacks = studyPacks.length > 0
    const hasDueCards = dueCount > 0
    const hasFilteredPacks = filteredAndSortedPacks.length > 0

    return (
        <>
            <CreatePackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="min-h-screen bg-[#F8FAFB] relative">
                {/* Subtle paper texture */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
                }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <Orb pose={welcomeOrb} size="md" />
                            <h1 className="text-[36px] font-bold text-[#1A1D2E] tracking-[-0.02em] leading-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                                {welcomeGreeting}{userData?.full_name ? `, ${userData.full_name}` : ''}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 ml-[68px]">
                            <p className="text-[16px] text-[#64748B]">
                                {hasDueCards ? 'Time to review and keep your momentum going' : hasPacks ? "You're all caught up!" : 'Ready to start your learning journey?'}
                            </p>
                            <span className="text-[#CBD5E1]">•</span>
                            <StreakDisplay variant="compact" />
                        </div>
                    </div>

                    {/* Dynamic Hero CTA - Paper Stack Style */}
                    {!hasPacks ? (
                        // First Pack Hero
                        <div className="mb-8 relative">
                            {/* Paper stack layers */}
                            <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />
                            
                            <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#5A5FF0]/40">
                                {/* Bookmark Tab */}
                                <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#5A5FF0] rounded-b-[5px] shadow-sm">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <h2 className="text-[28px] font-bold text-[#1A1D2E] mb-2">
                                            Create Your First Study Pack
                                        </h2>
                                        <p className="text-[15px] text-[#64748B] mb-1">
                                            Upload PDFs, documents, or paste URLs to generate AI-powered study materials
                                        </p>
                                        <p className="text-[13px] text-[#5A5FF0] font-medium">
                                            ✨ Get flashcards, quizzes, notes, and mind maps in seconds
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2 flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Pack
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Create New Pack and Continue/Balance Panels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Create New Pack CTA - Less prominent when cards are due */}
                        {hasPacks && (
                            <div className="md:col-span-1">
                                <div className="relative h-full">
                                    {/* Paper stack effect */}
                                    <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
                                    
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className={`relative w-full h-full rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border transition-all duration-200 group active:scale-[0.99] flex flex-col items-center justify-center text-center overflow-hidden ${
                                            hasDueCards
                                                ? 'bg-white hover:bg-[#F8FAFB] border-[#94A3B8]/30 hover:border-[#5A5FF0]/40'
                                                : 'bg-gradient-to-br from-[#1A1D2E] to-[#2A2D3E] hover:from-[#2A2D3E] hover:to-[#1A1D2E] border-[#5A5FF0]/30 hover:border-[#5A5FF0]/50 shadow-[0_2px_12px_rgba(90,95,240,0.15)]'
                                        }`}
                                    >
                                        {/* Highlight accent line - only when no due cards */}
                                        {!hasDueCards && (
                                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#5A5FF0] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                                        )}
                                        
                                        {/* Decorative Orb Image - Bottom Right */}
                                        <div className="absolute -bottom-8 -right-8 w-48 h-48 opacity-25 group-hover:opacity-35 transition-opacity">
                                            <Image
                                                src="/orb/sp_ds.png"
                                                alt=""
                                                width={192}
                                                height={192}
                                                className="object-contain"
                                            />
                                        </div>
                                        
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3 relative z-10 ${
                                            hasDueCards
                                                ? 'bg-[#5A5FF0]/10 border border-[#5A5FF0]/30'
                                                : 'bg-[#5A5FF0]/20 border border-[#5A5FF0]/40'
                                        }`}>
                                            <Plus className={`w-7 h-7 ${hasDueCards ? 'text-[#5A5FF0]' : 'text-[#5A5FF0]'}`} strokeWidth={2.5} />
                                        </div>
                                        <h3 className={`text-[18px] font-bold mb-2 relative z-10 ${
                                            hasDueCards ? 'text-[#1A1D2E]' : 'text-white'
                                        }`}>
                                            Create New Pack
                                        </h3>
                                        <p className={`text-[13px] mb-3 relative z-10 ${
                                            hasDueCards ? 'text-[#64748B]' : 'text-[#94A3B8]'
                                        }`}>
                                            Upload materials or paste URLs
                                        </p>
                                        <div className={`flex items-center gap-2 font-semibold text-[13px] group-hover:gap-3 transition-all relative z-10 ${
                                            hasDueCards ? 'text-[#5A5FF0]' : 'text-[#5A5FF0]'
                                        }`}>
                                            <span>Get Started</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className={hasPacks ? "md:col-span-2 space-y-6" : "md:col-span-3 space-y-6"}>
                            <ContinuePanel 
                                lastPackId={studyPacks[0]?.id}
                                lastPackTitle={studyPacks[0]?.title}
                                dueCountInPack={studyPacks[0]?.dueCount || 0}
                            />
                            <ExtraPacksBalance userId={userData?.id} userPlan={userData?.plan as 'free' | 'student_pro' | 'pro_plus'} />
                        </div>
                    </div>

                    {/* Stats Grid - Paper Cards with Consistent Styling */}
                    {hasPacks && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {/* Cards Mastered */}
                            <div className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Mastered</p>
                                </div>
                                <p className="text-[28px] font-bold text-[#1A1D2E] leading-none">{masteredCount}</p>
                                <p className="text-[13px] text-[#94A3B8] mt-1">cards</p>
                            </div>

                            {/* Quiz Accuracy */}
                            <div className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Accuracy</p>
                                </div>
                                <p className="text-[28px] font-bold text-[#1A1D2E] leading-none">
                                    {hasQuizResults ? `${avgAccuracy}%` : '—'}
                                </p>
                                <p className="text-[13px] text-[#94A3B8] mt-1">
                                    {hasQuizResults ? 'avg quiz score' : 'no quizzes yet'}
                                </p>
                            </div>

                            {/* Due Today */}
                            <div className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-[#F59E0B]" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Due Today</p>
                                </div>
                                <p className="text-[28px] font-bold text-[#1A1D2E] leading-none">{dueCount}</p>
                                <p className="text-[13px] text-[#94A3B8] mt-1">cards to review</p>
                            </div>

                            {/* Total Packs */}
                            <div className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Study Packs</p>
                                </div>
                                <p className="text-[28px] font-bold text-[#1A1D2E] leading-none">{studyPacks.length}</p>
                                <p className="text-[13px] text-[#94A3B8] mt-1">created</p>
                            </div>
                        </div>
                    )}

                    {/* Study Packs Section */}
                    {hasPacks && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[24px] font-bold text-[#1A1D2E]">Your Study Packs</h2>
                                <p className="text-[14px] text-[#64748B]">{studyPacks.length} pack{studyPacks.length !== 1 ? 's' : ''}</p>
                            </div>

                            {/* Search, Filter, Sort Controls */}
                            {studyPacks.length >= 3 && (
                                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <PackSearchBar
                                            value={searchQuery}
                                            onChange={setSearchQuery}
                                            packCount={filteredAndSortedPacks.length}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <PackFilters
                                            activeFilter={activeFilter}
                                            onChange={setActiveFilter}
                                            counts={filterCounts}
                                        />
                                        <PackSortDropdown
                                            activeSort={activeSort}
                                            onChange={setActiveSort}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Empty State for No Results */}
                            {!hasFilteredPacks ? (
                                <div className="relative bg-white rounded-xl p-12 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Orb pose="empty-state-inviting" size="lg" />
                                        <h3 className="text-[20px] font-bold text-[#1A1D2E] mt-6 mb-2">
                                            No packs found
                                        </h3>
                                        <p className="text-[15px] text-[#64748B] max-w-md mb-6">
                                            {searchQuery
                                                ? `No packs match "${searchQuery}". Try a different search term.`
                                                : 'No packs match your current filters. Try adjusting your filters.'}
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('')
                                                setActiveFilter('all')
                                            }}
                                            className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAndSortedPacks.map((pack) => {
                                        const cardCount = pack.stats_json?.cardCount || 0
                                        const progress = pack.stats_json?.progress || 0
                                        const dueCardsInPack = pack.dueCount || 0

                                        return (
                                            <Link
                                                key={pack.id}
                                                href={`/study-packs/${pack.id}`}
                                                className="group"
                                            >
                                                {/* Paper Stack Container */}
                                                <div className="relative">
                                                    {/* Backing sheet */}
                                                    <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
                                                    
                                                    {/* Main card */}
                                                    <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#94A3B8]/30 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(15,23,42,0.12),0_2px_4px_rgba(15,23,42,0.08)] overflow-hidden">
                                                        {/* Bookmark Tab - Amber for "needs attention" */}
                                                        {dueCardsInPack > 0 && (
                                                            <div className="absolute -top-0 right-8 w-[20px] h-[16px] bg-[#F59E0B] rounded-b-[3px] shadow-sm z-20">
                                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[14px] h-[2px] bg-[#D97706] rounded-t-sm" />
                                                            </div>
                                                        )}

                                                        {/* Decorative Orb Image - Bottom Right */}
                                                        <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.18] group-hover:opacity-[0.24] transition-opacity pointer-events-none">
                                                            <Image
                                                                src="/orb/sp_ds.png"
                                                                alt=""
                                                                width={128}
                                                                height={128}
                                                                className="object-contain"
                                                            />
                                                        </div>

                                                        {/* Header */}
                                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                                            <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-[#5A5FF0]" strokeWidth={2} />
                                                            </div>
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="text-[18px] font-bold text-[#1A1D2E] mb-2 line-clamp-2 group-hover:text-[#5A5FF0] transition-colors relative z-10">
                                                            {pack.title}
                                                        </h3>

                                                        {/* Summary */}
                                                        {pack.summary && (
                                                            <p className="text-[14px] text-[#64748B] line-clamp-2 mb-4 relative z-10">
                                                                {pack.summary}
                                                            </p>
                                                        )}

                                                        {/* Stats */}
                                                        <div className="flex items-center gap-4 text-[13px] text-[#64748B] pt-4 border-t border-[#E2E8F0] relative z-10">
                                                            <div className="flex items-center gap-1.5">
                                                                <BookOpen className="w-4 h-4" strokeWidth={2} />
                                                                <span>{cardCount} cards</span>
                                                            </div>
                                                            {dueCardsInPack > 0 && (
                                                                <div className="flex items-center gap-1.5 text-[#F59E0B] font-semibold">
                                                                    <Clock className="w-4 h-4" strokeWidth={2} />
                                                                    <span>Next due: {dueCardsInPack}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar */}
                                                        {progress > 0 && (
                                                            <div className="mt-4 relative z-10">
                                                                <div className="flex items-center justify-between text-[12px] text-[#64748B] mb-1.5">
                                                                    <span>Progress</span>
                                                                    <span className="font-semibold">{progress}%</span>
                                                                </div>
                                                                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-[#5A5FF0] rounded-full transition-all duration-300"
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
