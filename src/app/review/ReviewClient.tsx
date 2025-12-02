'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import StreakDisplay from '@/components/flashcards/StreakDisplay'
import { Package, BookOpen, Clock, ArrowLeft, Flame, Calendar, Filter } from 'lucide-react'

interface ReviewClientProps {
    userData: any
    studyPacks: any[]
    reviewData: {
        totalDueCount: number
        masteredCount: number
        avgAccuracy: number | null
        totalPacks: number
        packsWithDue: number
    }
}

export default function ReviewClient({ studyPacks, reviewData }: ReviewClientProps) {
    const { totalDueCount, packsWithDue } = reviewData
    const [sortBy, setSortBy] = useState<'most_due' | 'recent'>('most_due')
    const [filterBy, setFilterBy] = useState<'all' | 'due_today' | 'has_due'>('all')

    // Find the pack with most due cards for primary action
    const mostDuePack = studyPacks.find(p => p.dueCount > 0)

    // Calculate estimated review time (assuming 30 seconds per card)
    const estimatedMinutes = Math.ceil((totalDueCount * 30) / 60)

    // Filter and sort packs
    const filteredAndSortedPacks = useMemo(() => {
        let filtered = [...studyPacks]

        // Apply filters
        if (filterBy === 'has_due') {
            filtered = filtered.filter(p => p.dueCount > 0)
        } else if (filterBy === 'due_today') {
            filtered = filtered.filter(p => p.dueCount > 0)
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'most_due') {
                if (b.dueCount !== a.dueCount) {
                    return b.dueCount - a.dueCount
                }
            }
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        })

        return filtered
    }, [studyPacks, sortBy, filterBy])

    const filterCounts = {
        all: studyPacks.length,
        has_due: studyPacks.filter(p => p.dueCount > 0).length,
        due_today: studyPacks.filter(p => p.dueCount > 0).length, // Could be refined with actual "today" logic
    }

    return (
        <div className="min-h-screen bg-[#F8FAFB] relative">
            {/* Subtle paper texture */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
            }} />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Back Button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1A1D2E] transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-[15px] font-medium">Back to Dashboard</span>
                </Link>

                {/* Header with Primary Action */}
                <div className="mb-8 animate-in fade-in duration-1000">
                    <div className="flex items-start justify-between gap-6 mb-4">
                        <div className="flex-1">
                            <h1 className="text-[36px] font-bold text-[#1A1D2E] tracking-[-0.02em] leading-tight mb-2" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                                Review
                            </h1>
                            <div className="flex items-center gap-3">
                                <p className="text-[16px] text-[#64748B]">
                                    {totalDueCount > 0
                                        ? `${totalDueCount} card${totalDueCount !== 1 ? 's' : ''} ready for review across ${packsWithDue} pack${packsWithDue !== 1 ? 's' : ''}`
                                        : studyPacks.length > 0
                                            ? "You're all caught up! Great work."
                                            : "Create your first study pack to get started"
                                    }
                                </p>
                                <span className="text-[#CBD5E1]">•</span>
                                <StreakDisplay variant="compact" />
                            </div>
                        </div>
                        {mostDuePack && (
                            <Link
                                href={`/study-packs/${mostDuePack.id}?tab=flashcards`}
                                className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2 flex items-center gap-2 shadow-sm"
                            >
                                <Flame className="w-5 h-5" />
                                Start Review
                            </Link>
                        )}
                    </div>
                </div>

                {/* Review-Specific Stats */}
                {studyPacks.length > 0 && totalDueCount > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 animate-in slide-in-from-bottom duration-700">
                        {/* Due Today */}
                        <div className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-[#F59E0B]" strokeWidth={2.5} />
                                </div>
                                <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Due Today</p>
                            </div>
                            <p className="text-[28px] font-bold text-[#1A1D2E] leading-none">{totalDueCount}</p>
                            <p className="text-[13px] text-[#94A3B8] mt-1">cards to review</p>
                        </div>

                        {/* Estimated Time */}
                        <div className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2.5} />
                                </div>
                                <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Est. Time</p>
                            </div>
                            <p className="text-[28px] font-bold text-[#1A1D2E] leading-none">{estimatedMinutes}</p>
                            <p className="text-[13px] text-[#94A3B8] mt-1">minutes</p>
                        </div>

                        {/* Packs with Due Cards */}
                        <div className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2.5} />
                                </div>
                                <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Active Packs</p>
                            </div>
                            <p className="text-[28px] font-bold text-[#1A1D2E] leading-none">{packsWithDue}</p>
                            <p className="text-[13px] text-[#94A3B8] mt-1">need review</p>
                        </div>
                    </div>
                )}

                {/* Section Title with Filters */}
                {studyPacks.length > 0 && (
                    <div className="mb-6 animate-in slide-in-from-bottom duration-700 delay-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-[24px] font-bold text-[#1A1D2E]">Choose a Pack</h2>
                                <p className="text-[14px] text-[#64748B] mt-1">Select a pack to start reviewing</p>
                            </div>
                            
                            {/* Sort & Filter Controls */}
                            {studyPacks.length > 3 && (
                                <div className="flex items-center gap-3">
                                    {/* Filter Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={filterBy}
                                            onChange={(e) => setFilterBy(e.target.value as any)}
                                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[14px] text-[#1A1D2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:border-[#5A5FF0] transition-colors cursor-pointer"
                                        >
                                            <option value="all">All Packs ({filterCounts.all})</option>
                                            <option value="has_due">Has Due ({filterCounts.has_due})</option>
                                            <option value="due_today">Due Today ({filterCounts.due_today})</option>
                                        </select>
                                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                                    </div>

                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[14px] text-[#1A1D2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:border-[#5A5FF0] transition-colors cursor-pointer"
                                        >
                                            <option value="most_due">Most Due</option>
                                            <option value="recent">Recently Updated</option>
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Study Packs Grid */}
                {studyPacks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700 delay-200">
                        {filteredAndSortedPacks.map((pack, index) => {
                            const cardCount = pack.stats_json?.cardCount || 0
                            const progress = pack.stats_json?.progress || 0
                            const dueCount = pack.dueCount || 0

                            return (
                                <Link
                                    key={pack.id}
                                    href={`/study-packs/${pack.id}`}
                                    className="group animate-in slide-in-from-bottom duration-700"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Paper Stack Container */}
                                    <div className="relative">
                                        {/* Backing sheet */}
                                        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
                                        
                                        {/* Main card */}
                                        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#94A3B8]/30 transition-all duration-200 hover:translate-y-[-3px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.12),0_4px_8px_rgba(15,23,42,0.08)] hover:border-[#5A5FF0]/40 cursor-pointer">
                                            {/* Bookmark Tab - Neutral gray for due */}
                                            {dueCount > 0 && (
                                                <div className="absolute -top-0 right-8 w-[20px] h-[16px] bg-[#94A3B8] rounded-b-[3px] shadow-sm">
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[14px] h-[2px] bg-[#64748B] rounded-t-sm" />
                                                </div>
                                            )}

                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-[#5A5FF0]" strokeWidth={2} />
                                                </div>
                                                {dueCount > 0 && (
                                                    <div className="px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#CBD5E1]">
                                                        <p className="text-[12px] font-bold text-[#64748B]">{dueCount} due</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-[18px] font-bold text-[#1A1D2E] mb-2 line-clamp-2 group-hover:text-[#5A5FF0] transition-colors">
                                                {pack.title}
                                            </h3>

                                            {/* Summary */}
                                            {pack.summary && (
                                                <p className="text-[14px] text-[#64748B] line-clamp-2 mb-4">
                                                    {pack.summary}
                                                </p>
                                            )}

                                            {/* Progress Bar */}
                                            {progress > 0 && (
                                                <div className="mb-4">
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

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-[13px] text-[#64748B] pt-4 border-t border-[#E2E8F0]">
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen className="w-4 h-4" strokeWidth={2} />
                                                    <span>{cardCount} cards</span>
                                                </div>
                                            </div>

                                            {/* Last Activity */}
                                            <p className="text-[12px] text-[#94A3B8] mt-2">
                                                Updated {new Date(pack.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    // Empty State
                    <div className="relative bg-white rounded-xl p-12 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-xl bg-[#5A5FF0]/10 flex items-center justify-center mb-6">
                                <Package className="w-8 h-8 text-[#5A5FF0]" />
                            </div>
                            <h3 className="text-[20px] font-bold text-[#1A1D2E] mb-2">No Study Packs Yet</h3>
                            <p className="text-[15px] text-[#64748B] max-w-md mb-6">
                                Create your first study pack to start reviewing and mastering your materials
                            </p>
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
