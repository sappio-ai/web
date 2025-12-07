'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PackHeader from './PackHeader'
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
}

export default function StudyPackView({ pack, userPlan }: StudyPackViewProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabType | null

  // Initialize with tab from URL or default to 'notes'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (tabParam && ['notes', 'flashcards', 'quiz', 'mindmap', 'insights'].includes(tabParam)) {
      return tabParam
    }
    return 'notes'
  })

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ['notes', 'flashcards', 'quiz', 'mindmap', 'insights'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <div className="min-h-screen bg-[#F8FAFB] relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <PackHeader pack={pack} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-8">
          {activeTab === 'notes' && <NotesTab notes={pack.stats.notes} studyPackId={pack.id} userPlan={userPlan} />}
          {activeTab === 'flashcards' && <FlashcardsTab packId={pack.id} userPlan={userPlan} />}
          {activeTab === 'quiz' && <QuizTab packId={pack.id} userPlan={userPlan} />}
          {activeTab === 'mindmap' && <MindMapTab packId={pack.id} />}
          {activeTab === 'insights' && <InsightsTab packId={pack.id} userPlan={userPlan} />}
        </div>
      </div>
    </div>
  )
}

