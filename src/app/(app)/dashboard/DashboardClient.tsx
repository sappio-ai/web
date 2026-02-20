'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import CreatePackModal from '@/components/materials/CreatePackModal'
import StreakDisplay from '@/components/flashcards/StreakDisplay'
import PackSearchBar from '@/components/dashboard/PackSearchBar'
import PackFilters from '@/components/dashboard/PackFilters'
import PackSortDropdown from '@/components/dashboard/PackSortDropdown'
import ExtraPacksBalance from '@/components/dashboard/ExtraPacksBalance'
import ContinuePanel from '@/components/dashboard/ContinuePanel'
import StudyRoomPromo from '@/components/dashboard/StudyRoomPromo'
import XPWidget from '@/components/dashboard/XPWidget'
import WeeklyChallenges from '@/components/dashboard/WeeklyChallenges'
import TrialExpiredModal from '@/components/paywall/TrialExpiredModal'
import TrialBanner from '@/components/dashboard/TrialBanner'
import Orb from '@/components/orb/Orb'
import { useOrb } from '@/lib/contexts/OrbContext'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import { Package, BookOpen, Target, TrendingUp, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useRouter } from 'next/navigation'
import WelcomeModal from '@/components/onboarding/WelcomeModal'
import DashboardTour from '@/components/onboarding/DashboardTour'
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist'
// Removed sonner import as not needed for sample pack anymore

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
        hasRooms: boolean
    }
}

export default function DashboardClient({
    userData,
    studyPacks,
    dashboardData,
}: DashboardClientProps) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [runTour, setRunTour] = useState(false)

    // Track if welcome has been dismissed THIS session (prevents re-showing after close)
    const [welcomeDismissed, setWelcomeDismissed] = useState(false)
    const [freezeToast, setFreezeToast] = useState(false)

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'has_due' | 'recent' | 'needs_review'>('all')
    const [activeSort, setActiveSort] = useState<'updated' | 'alphabetical' | 'due_cards' | 'progress'>('updated')

    const { getWelcomeOrb } = useOrb()
    const { dueCount, packsWithDueCards, masteredCount, avgAccuracy, hasQuizResults } = dashboardData

    // Onboarding State
    const onboardingMeta = userData?.meta_json?.onboarding || {}
    const hasSeenWelcomeInDB = onboardingMeta.seen_welcome
    const hasPacks = studyPacks.length > 0
    const hasDueCards = dueCount > 0

    // Determine if we should show welcome modal
    // Show if: not seen in DB, not dismissed this session, and no packs
    const showWelcomeModal = !hasSeenWelcomeInDB && !welcomeDismissed && !hasPacks

    // Start tour after welcome is dismissed (either this session or from DB)
    useEffect(() => {
        // If user is new (based on DB), ensure we clear any stale local storage state
        if (!hasSeenWelcomeInDB) {
            localStorage.removeItem('sappio_tour_completed')
        }

        const tourCompletedLocal = localStorage.getItem('sappio_tour_completed') === 'true'
        const shouldStartTour = (hasSeenWelcomeInDB || welcomeDismissed) && !tourCompletedLocal && !showWelcomeModal

        if (shouldStartTour) {
            // Small delay to let modal animation finish
            const timer = setTimeout(() => setRunTour(true), 500)
            return () => clearTimeout(timer)
        }
    }, [hasSeenWelcomeInDB, welcomeDismissed, showWelcomeModal])

    const handleCloseWelcome = async () => {
        // Immediately dismiss the modal via local state
        setWelcomeDismissed(true)

        // Then update the database in the background
        try {
            await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seen_welcome' })
            })
        } catch (error) {
            console.error('Failed to update onboarding status', error)
        }
    }

    const handleCreateFirstPack = () => {
        handleCloseWelcome()
        setIsModalOpen(true)
    }

    const handleTourFinish = () => {
        setRunTour(false)
        localStorage.setItem('sappio_tour_completed', 'true')
    }

    // Determine Greeting
    const welcomeOrb = getWelcomeOrb()
    const welcomeGreeting = welcomeOrb === 'welcome-back-morning' ? 'Good morning' :
        welcomeOrb === 'welcome-back-afternoon' ? 'Good afternoon' :
            'Good evening'

    // Streak freeze toast
    const streakData = userData?.meta_json?.streak
    useEffect(() => {
        if (streakData?.freezeJustUsed) {
            setFreezeToast(true)
            // Clear the flag
            fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'clear_freeze_used' })
            }).catch(() => {})
            const timer = setTimeout(() => setFreezeToast(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [streakData?.freezeJustUsed])

    // Trial expired modal
    const trialMeta = userData?.meta_json?.trial
    const isTrialExpired = userData?.plan === 'free' && trialMeta && !userData?.meta_json?.seen_trial_expired
    const [showTrialExpired, setShowTrialExpired] = useState(!!isTrialExpired)

    const handleCloseTrialExpired = async () => {
        setShowTrialExpired(false)
        try {
            await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seen_trial_expired' })
            })
        } catch {}
    }

    // Trial countdown banner
    const isInTrial = userData?.plan === 'student_pro' && trialMeta?.expires_at
    const trialDaysRemaining = isInTrial
        ? Math.max(0, Math.ceil((new Date(trialMeta.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0

    const debouncedSearch = useDebounce(searchQuery, 300)

    // Analytics
    useEffect(() => {
        if (debouncedSearch) AnalyticsService.trackPackSearched(debouncedSearch)
    }, [debouncedSearch])

    useEffect(() => {
        if (activeFilter !== 'all') AnalyticsService.trackPackFiltered(activeFilter)
    }, [activeFilter])

    const hasSortInteracted = useRef(false)
    useEffect(() => {
        if (hasSortInteracted.current) {
            AnalyticsService.trackPackSorted(activeSort)
        }
        hasSortInteracted.current = true
    }, [activeSort])

    // Filter Logic
    const filteredAndSortedPacks = useMemo(() => {
        let filtered = [...studyPacks]

        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase()
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.summary?.toLowerCase().includes(query)
            )
        }

        if (activeFilter === 'has_due') {
            filtered = filtered.filter(p => p.dueCount > 0)
        } else if (activeFilter === 'recent') {
            const date = new Date()
            date.setDate(date.getDate() - 7)
            filtered = filtered.filter(p => new Date(p.updated_at) >= date)
        } else if (activeFilter === 'needs_review') {
            filtered = filtered.filter(p => (p.stats_json?.progress || 0) < 50)
        }

        filtered.sort((a, b) => {
            switch (activeSort) {
                case 'alphabetical': return a.title.localeCompare(b.title)
                case 'due_cards': return b.dueCount - a.dueCount
                case 'progress': return (b.stats_json?.progress || 0) - (a.stats_json?.progress || 0)
                case 'updated': default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            }
        })

        return filtered
    }, [studyPacks, debouncedSearch, activeFilter, activeSort])

    const filterCounts = useMemo(() => {
        const date = new Date()
        date.setDate(date.getDate() - 7)
        return {
            all: studyPacks.length,
            has_due: studyPacks.filter(p => p.dueCount > 0).length,
            recent: studyPacks.filter(p => new Date(p.updated_at) >= date).length,
            needs_review: studyPacks.filter(p => (p.stats_json?.progress || 0) < 50).length,
        }
    }, [studyPacks])

    // Check local progress + DB meta
    const progress = {
        has_created_pack: hasPacks || !!onboardingMeta.has_created_pack,
        has_reviewed_flashcards: !!onboardingMeta.has_reviewed_flashcards,
        has_taken_quiz: !!onboardingMeta.has_taken_quiz || hasQuizResults
    }

    // If fully onboarding complete, no need to show checklist
    const showChecklist = !progress.has_created_pack || !progress.has_reviewed_flashcards || !progress.has_taken_quiz

    return (
        <>
            <WelcomeModal
                isOpen={showWelcomeModal}
                userName={userData?.full_name?.split(' ')[0]}
                onClose={handleCloseWelcome}
                onCreatePack={handleCreateFirstPack}
            />

            <DashboardTour
                run={runTour}
                onFinish={handleTourFinish}
                hasPacks={hasPacks}
            />

            <CreatePackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <TrialExpiredModal
                isOpen={showTrialExpired}
                onClose={handleCloseTrialExpired}
                currentPlan={userData?.plan}
            />

            {/* Streak Freeze Toast */}
            {freezeToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
                    <div className="bg-white rounded-xl border border-[#3B82F6]/30 shadow-xl p-4 flex items-center gap-3 max-w-sm">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                            <span className="text-lg">❄️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1D2E]">Streak Freeze Used!</p>
                            <p className="text-xs text-[#64748B]">Your {streakData?.currentStreak}-day streak was saved</p>
                        </div>
                        <button onClick={() => setFreezeToast(false)} className="text-[#94A3B8] hover:text-[#1A1D2E] p-1">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        </button>
                    </div>
                </div>
            )}

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


                    {/* Trial Countdown Banner */}
                    {isInTrial && trialDaysRemaining > 0 && (
                        <TrialBanner daysRemaining={trialDaysRemaining} currentPlan={userData?.plan} />
                    )}

                    {/* Onboarding Checklist - Show for all users who haven't completed onboarding */}
                    {showChecklist && (hasSeenWelcomeInDB || welcomeDismissed) && (
                        <OnboardingChecklist progress={progress} />
                    )}

                    {/* Dynamic Hero CTA - Paper Stack Style */}
                    {!hasPacks ? (
                        // First Pack Hero
                        <div className="mb-8 relative" data-tour="create-pack">
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
                                        <div className="flex items-center gap-4 mt-4 text-[13px] font-medium text-[#64748B]">
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#5A5FF0]" />
                                                Flashcards
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#5A5FF0]" />
                                                Quizzes
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#5A5FF0]" />
                                                Mind Maps
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-lg shadow-[#5A5FF0]/20"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create Pack
                                        </button>

                                        {/* Sample pack button removed */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Hero Row: Continue Learning + XP Widget */}
                    {hasPacks && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <ContinuePanel
                                    packs={studyPacks
                                        .filter((p: any) => p.dueCount > 0)
                                        .map((p: any) => ({ id: p.id, title: p.title, dueCount: p.dueCount }))}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <XPWidget />
                            </div>
                        </div>
                    )}

                    {/* Stats Grid - Hide for new users */}
                    {hasPacks && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-tour="stats-grid">
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

                    {/* Weekly Challenges */}
                    {hasPacks && <WeeklyChallenges />}

                    {/* Study Packs Section */}
                    {hasPacks && (
                        <div data-tour="recent-packs">
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
                            {!filteredAndSortedPacks.length ? (
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

                                    {/* Create New Pack Card */}
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="group relative"
                                    >
                                        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border-2 border-dashed border-[#CBD5E1] transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(15,23,42,0.12)] hover:border-[#5A5FF0]/50 h-full flex flex-col items-center justify-center min-h-[200px] gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[#5A5FF0]/10 flex items-center justify-center group-hover:bg-[#5A5FF0]/20 transition-colors">
                                                <Plus className="w-7 h-7 text-[#5A5FF0]" strokeWidth={2} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[16px] font-semibold text-[#1A1D2E] group-hover:text-[#5A5FF0] transition-colors">Create New Pack</p>
                                                <p className="text-[13px] text-[#94A3B8] mt-1">Upload materials to study</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Secondary Info: Extra Packs + Study Room */}
                    {hasPacks && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <ExtraPacksBalance userId={userData?.id} userPlan={userData?.plan || 'free'} />
                            <StudyRoomPromo hasRooms={dashboardData.hasRooms} />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
