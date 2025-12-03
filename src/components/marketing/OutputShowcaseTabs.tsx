'use client'

import { useState } from 'react'
import { Clock, Target } from 'lucide-react'
import BookmarkCorner from '@/components/ui/BookmarkNotch'

export default function OutputShowcaseTabs() {
  const [activeTab, setActiveTab] = useState(0)
  
  const tabs = [
    { label: 'Flashcards', color: 'var(--primary)' },
    { label: 'Quiz', color: 'var(--accent)' },
    { label: 'Summary', color: '#F59E0B' },
    { label: 'Mind map', color: '#8B5CF6' }
  ]
  
  return (
    <div>
      {/* Output chips as tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all ${
              activeTab === i
                ? 'text-white shadow-md'
                : 'bg-white text-[var(--text)] border border-[var(--border)] hover:border-[var(--primary)]'
            }`}
            style={activeTab === i ? { backgroundColor: tab.color } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative">
        <BookmarkCorner size="md" />
        
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
                      What is the primary function of mitochondria in eukaryotic cells?
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold rounded-full ml-4">
                    Medium
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-[var(--text)]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ~2 min
                  </span>
                  <span>•</span>
                  <span>22 due today</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-[var(--text)] mb-2">Answer</p>
                <p className="text-base text-[var(--ink)] leading-relaxed">
                  Mitochondria are responsible for producing ATP through cellular respiration, serving as the cell&apos;s primary energy source.
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--text)]">Due: Tomorrow</span>
                <span className="text-sm font-semibold text-[var(--primary)]">Review count: 3</span>
              </div>
            </div>
          )}
          
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-lg font-bold text-[var(--ink)]">Practice Quiz</h3>
              </div>
              {['What is the powerhouse of the cell?', 'Describe the process of cellular respiration', 'What are the main components of a mitochondrion?'].map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-[var(--bg)] rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
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
              {['Mitochondria produce ATP through cellular respiration', 'They have a double membrane structure', 'Contain their own DNA (mtDNA)', 'Play a key role in cell metabolism'].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-2 flex-shrink-0" />
                  <p className="text-base text-[var(--ink)] leading-relaxed flex-1">{point}</p>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 3 && (
            <div>
              <h3 className="text-lg font-bold text-[var(--ink)] mb-6">Cellular Respiration</h3>
              {/* Simple SVG mind map preview */}
              <svg className="w-full h-64" viewBox="0 0 600 300">
                <circle cx="300" cy="150" r="50" fill="var(--primary)" opacity="0.1" stroke="var(--primary)" strokeWidth="2" />
                <text x="300" y="155" textAnchor="middle" className="text-sm font-bold" fill="var(--ink)">Mitochondria</text>
                
                <line x1="350" y1="150" x2="450" y2="100" stroke="var(--primary)" strokeWidth="2" opacity="0.3" />
                <circle cx="470" cy="90" r="40" fill="#8B5CF6" opacity="0.1" stroke="#8B5CF6" strokeWidth="2" />
                <text x="470" y="95" textAnchor="middle" className="text-xs font-semibold" fill="var(--ink)">ATP</text>
                
                <line x1="350" y1="150" x2="450" y2="200" stroke="var(--primary)" strokeWidth="2" opacity="0.3" />
                <circle cx="470" cy="210" r="40" fill="var(--accent)" opacity="0.1" stroke="var(--accent)" strokeWidth="2" />
                <text x="470" y="215" textAnchor="middle" className="text-xs font-semibold" fill="var(--ink)">Respiration</text>
                
                <line x1="250" y1="150" x2="150" y2="150" stroke="var(--primary)" strokeWidth="2" opacity="0.3" />
                <circle cx="130" cy="150" r="40" fill="#F59E0B" opacity="0.1" stroke="#F59E0B" strokeWidth="2" />
                <text x="130" y="155" textAnchor="middle" className="text-xs font-semibold" fill="var(--ink)">Structure</text>
              </svg>
              <p className="text-sm text-[var(--text)] text-center mt-4">
                Visual connections between concepts
              </p>
            </div>
          )}
          
          <p className="text-xs text-[var(--text)] text-center mt-6 pt-6 border-t border-[var(--border)]">
            Generated from your uploaded material
          </p>
        </div>
      </div>
    </div>
  )
}
