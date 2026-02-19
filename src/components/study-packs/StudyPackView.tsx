'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import PackHeader from './PackHeader'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import TabNavigation from './TabNavigation'
import NotesTab from './tabs/NotesTab'
import FlashcardsTab from './tabs/FlashcardsTab'
import QuizTab from './tabs/QuizTab'
import InsightsTab from './tabs/InsightsTab'
import MindMapTab from './tabs/MindMapTab'

export type TabType = 'notes' | 'flashcards' | 'quiz' | 'mindmap' | 'insights'

interface StudyPackViewProps {
  pack: {
    id: string
    title: string
    summary: string | null
    createdAt: string
    updatedAt: string
    material: {
      id: string
      kind: string
      sourceUrl: string | null
      pageCount: number | null
      status: string
    } | null
    stats: {
      coverage: number
      cardCount: number
      quizQuestionCount: number
      notes: any
      learningObjectives?: string[]
      tags?: string[]
    }
  }
  userPlan: string
  isDemo?: boolean
}

export default function StudyPackView({ pack, userPlan, isDemo = false }: StudyPackViewProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabType | null

  // Initialize with tab from URL, or default to flashcards if cards exist, else notes
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (tabParam && ['notes', 'flashcards', 'quiz', 'mindmap', 'insights'].includes(tabParam)) {
      return tabParam
    }
    // Default to flashcards when the pack has cards — this is the core value
    return pack.stats.cardCount > 0 ? 'flashcards' : 'notes'
  })

  // Track pack opened on mount
  const hasTrackedOpen = useRef(false)
  useEffect(() => {
    if (!isDemo && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true
      AnalyticsService.trackPackOpened(pack.id)
    }
  }, [pack.id, isDemo])

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ['notes', 'flashcards', 'quiz', 'mindmap', 'insights'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Shared pack data fetched once and passed to all tabs
  const [packData, setPackData] = useState<any>(null)

  const fetchPackData = useCallback(async () => {
    try {
      const response = await fetch(`/api/study-packs/${pack.id}`)
      if (response.ok) {
        const data = await response.json()
        setPackData(data)
      }
    } catch (error) {
      console.error('Failed to fetch pack data:', error)
    }
  }, [pack.id])

  useEffect(() => {
    fetchPackData()
  }, [fetchPackData])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (!isDemo) {
      AnalyticsService.trackTabSwitched(pack.id, tab)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <PackHeader pack={pack} isDemo={isDemo} />
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="mt-8">
          {activeTab === 'notes' && <NotesTab notes={pack.stats.notes} studyPackId={pack.id} userPlan={userPlan} onNavigateToTab={(tab) => handleTabChange(tab as TabType)} />}
          {activeTab === 'flashcards' && <FlashcardsTab packId={pack.id} userPlan={userPlan} isDemo={isDemo} onNavigateToTab={(tab) => handleTabChange(tab as TabType)} packData={packData} />}
          {activeTab === 'quiz' && <QuizTab packId={pack.id} userPlan={userPlan} isDemo={isDemo} packData={packData} />}
          {activeTab === 'mindmap' && <MindMapTab packId={pack.id} userPlan={userPlan} isDemo={isDemo} packData={packData} />}
          {activeTab === 'insights' && <InsightsTab packId={pack.id} userPlan={userPlan} isDemo={isDemo} packData={packData} />}
        </div>
      </div>
    </div>
  )
}

