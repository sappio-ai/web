'use client'

import { FileText, CreditCard, HelpCircle, Map, BarChart3 } from 'lucide-react'
import type { TabType } from './StudyPackView'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: 'notes' as TabType, label: 'Notes', icon: FileText },
  { id: 'flashcards' as TabType, label: 'Flashcards', icon: CreditCard },
  { id: 'quiz' as TabType, label: 'Quiz', icon: HelpCircle },
  { id: 'mindmap' as TabType, label: 'Mind Map', icon: Map },
  { id: 'insights' as TabType, label: 'Insights', icon: BarChart3 },
]

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="relative animate-in slide-in-from-bottom duration-700 delay-100">
      <div className="relative bg-white rounded-xl p-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-[14px]
                  ${
                    isActive
                      ? 'bg-[#5A5FF0] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#1A1D2E] hover:bg-[#F1F5F9]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

