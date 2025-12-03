'use client'

import { useState } from 'react'
import { Clock, Target } from 'lucide-react'

export default function OutputTabs() {
  const [activeTab, setActiveTab] = useState(0)
  
  const tabs = ['Flashcards', 'Quiz', 'Summary']
  
  const content = [
    {
      type: 'Flashcard',
      question: 'What is the primary function of mitochondria in eukaryotic cells?',
      answer: 'Mitochondria are responsible for producing ATP through cellular respiration, serving as the cell\'s primary energy source.',
      meta: { difficulty: 'Medium', due: 'Tomorrow', reviews: 3 }
    },
    {
      type: 'Quiz',
      questions: [
        'What is the powerhouse of the cell?',
        'Describe the process of cellular respiration',
        'What are the main components of a mitochondrion?'
      ]
    },
    {
      type: 'Summary',
      points: [
        'Mitochondria produce ATP through cellular respiration',
        'They have a double membrane structure',
        'Contain their own DNA (mtDNA)',
        'Play a key role in cell metabolism and energy production'
      ]
    }
  ]
  
  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === i
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'bg-white text-[var(--text)] border border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div 
        className="bg-white rounded-2xl p-8 border border-[var(--border)]"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="pb-6 border-b border-[var(--border)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text)] mb-2">Question</p>
                  <p className="text-lg font-semibold text-[var(--ink)]">
                    {content[0].question}
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold rounded-full ml-4">
                  {content[0].meta?.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--text)]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  ~2 min
                </span>
                <span>•</span>
                <span>22 due today</span>
                <span>•</span>
                <span>Biology 101</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-[var(--text)] mb-2">Answer</p>
              <p className="text-base text-[var(--ink)] leading-relaxed">
                {content[0].answer}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <span className="text-sm text-[var(--text)]">Due: {content[0].meta?.due}</span>
              <span className="text-sm font-semibold text-[var(--primary)]">Review count: {content[0].meta?.reviews}</span>
            </div>
          </div>
        )}
        
        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="text-lg font-bold text-[var(--ink)]">Practice Quiz</h3>
            </div>
            {content[1].questions?.map((q, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-[var(--bg)] rounded-xl">
                <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-base text-[var(--ink)] flex-1">{q}</p>
              </div>
            ))}
            <div className="pt-4 text-sm text-[var(--text)]">
              10 questions • Multiple choice • ~15 min
            </div>
          </div>
        )}
        
        {activeTab === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--ink)] mb-4">Key Concepts</h3>
            {content[2].points?.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 flex-shrink-0" />
                <p className="text-base text-[var(--ink)] leading-relaxed flex-1">{point}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
