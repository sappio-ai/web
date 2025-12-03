'use client'

import { useState } from 'react'
import { Check, Clock, Star, ChevronRight } from 'lucide-react'

export default function SeeTheOutput() {
  const [activeTab, setActiveTab] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  
  const tabs = [
    { 
      label: 'Mind map',
      bullets: [
        'Auto-clustered by topic',
        'Clickable nodes open the source snippet',
        'Export to PNG or PDF'
      ],
      proof: {
        file: 'Neuroscience_Lecture_Notes.pdf',
        time: '38s',
        rating: '4.6/5'
      }
    },
    { 
      label: 'Flashcards',
      bullets: [
        'Spaced repetition scheduling',
        'Difficulty auto-adjusted',
        'Export to Anki format'
      ],
      proof: {
        file: 'Neuroscience_Lecture_Notes.pdf',
        time: '22s',
        rating: '4.8/5'
      }
    },
    { 
      label: 'Quiz',
      bullets: [
        'Multiple choice and open-ended',
        'Instant feedback with explanations',
        'Track your weak spots'
      ],
      proof: {
        file: 'Neuroscience_Lecture_Notes.pdf',
        time: '31s',
        rating: '4.7/5'
      }
    },
    { 
      label: 'Summary',
      bullets: [
        'Key concepts extracted',
        'Hierarchical structure',
        'Copy or export as markdown'
      ],
      proof: {
        file: 'Neuroscience_Lecture_Notes.pdf',
        time: '18s',
        rating: '4.9/5'
      }
    }
  ]
  
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-bold text-[var(--ink)] mb-4 tracking-[-0.01em]">
            See exactly what you get
          </h2>
          <p className="text-xl text-[var(--text)] max-w-3xl mx-auto">
            Flashcards, quizzes, summaries, and mind maps generated from your material.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
          {/* Left: Tabs + bullets */}
          <div>
            {/* Tabs */}
            <div className="flex flex-col gap-2 mb-8">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveTab(i)
                    setIsFlipped(false)
                  }}
                  className={`px-6 py-4 text-left text-base font-semibold rounded-xl transition-all ${
                    activeTab === i
                      ? 'bg-[var(--primary)] text-white shadow-md'
                      : 'bg-[var(--bg)] text-[var(--text)] hover:bg-white border border-[var(--border)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Bullets */}
            <div className="space-y-3 mb-8">
              {tabs[activeTab].bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <p className="text-base text-[var(--ink)]">{bullet}</p>
                </div>
              ))}
            </div>
            
            {/* Proof row */}
            <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)]">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <span className="font-semibold text-[var(--ink)]">Generated from:</span>
                  <span className="truncate">{tabs[activeTab].proof.file}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--text)]" />
                    <span className="text-[var(--text)]">{tabs[activeTab].proof.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-[var(--text)]">{tabs[activeTab].proof.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Big demo preview */}
          <div className="relative">
            {activeTab === 0 && (
              // Mind map - matching current design with clean white background
              <div className="min-h-[700px] flex items-start justify-center p-8 pt-12">
                <div 
                  className="relative w-full max-w-4xl h-[600px] rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.12),0_2px_4px_rgba(15,23,42,0.08)]"
                >
                  {/* Subtle dot pattern background */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle, #5A5FF0 1px, transparent 1px)`,
                      backgroundSize: '24px 24px',
                    }} />
                  </div>
                  
                  {/* Mind map content */}
                  <svg className="w-full h-full p-8" viewBox="0 0 800 600">
                    {/* Central node */}
                    <g>
                      <rect x="300" y="250" width="200" height="80" rx="12" fill="#5A5FF0" opacity="0.1" stroke="#5A5FF0" strokeWidth="2" />
                      <text x="400" y="285" textAnchor="middle" className="text-base font-bold" fill="#1A1D2E">Neuroscience</text>
                      <text x="400" y="305" textAnchor="middle" className="text-sm" fill="#64748B">Lecture Notes</text>
                    </g>
                    
                    {/* Branch 1: Neurons */}
                    <line x1="350" y1="250" x2="150" y2="100" stroke="#5A5FF0" strokeWidth="2" opacity="0.3" />
                    <g>
                      <rect x="50" y="70" width="200" height="60" rx="8" fill="#8B5CF6" opacity="0.1" stroke="#8B5CF6" strokeWidth="2" />
                      <text x="150" y="95" textAnchor="middle" className="text-sm font-semibold" fill="#1A1D2E">Neurons</text>
                      <text x="150" y="115" textAnchor="middle" className="text-xs" fill="#64748B">Structure & Function</text>
                    </g>
                    
                    {/* Branch 2: Synapses */}
                    <line x1="450" y1="250" x2="650" y2="100" stroke="#5A5FF0" strokeWidth="2" opacity="0.3" />
                    <g>
                      <rect x="550" y="70" width="200" height="60" rx="8" fill="#10B981" opacity="0.1" stroke="#10B981" strokeWidth="2" />
                      <text x="650" y="95" textAnchor="middle" className="text-sm font-semibold" fill="#1A1D2E">Synapses</text>
                      <text x="650" y="115" textAnchor="middle" className="text-xs" fill="#64748B">Signal Transmission</text>
                    </g>
                    
                    {/* Branch 3: Neurotransmitters */}
                    <line x1="300" y1="300" x2="100" y2="450" stroke="#5A5FF0" strokeWidth="2" opacity="0.3" />
                    <g>
                      <rect x="20" y="420" width="160" height="60" rx="8" fill="#F59E0B" opacity="0.1" stroke="#F59E0B" strokeWidth="2" />
                      <text x="100" y="445" textAnchor="middle" className="text-sm font-semibold" fill="#1A1D2E">Neurotransmitters</text>
                      <text x="100" y="465" textAnchor="middle" className="text-xs" fill="#64748B">Chemical Messengers</text>
                    </g>
                    
                    {/* Branch 4: Brain Regions */}
                    <line x1="500" y1="300" x2="700" y2="450" stroke="#5A5FF0" strokeWidth="2" opacity="0.3" />
                    <g>
                      <rect x="620" y="420" width="160" height="60" rx="8" fill="#EC4899" opacity="0.1" stroke="#EC4899" strokeWidth="2" />
                      <text x="700" y="445" textAnchor="middle" className="text-sm font-semibold" fill="#1A1D2E">Brain Regions</text>
                      <text x="700" y="465" textAnchor="middle" className="text-xs" fill="#64748B">Cortex & Limbic</text>
                    </g>
                    
                    {/* Branch 5: Action Potential */}
                    <line x1="400" y1="330" x2="400" y2="520" stroke="#5A5FF0" strokeWidth="2" opacity="0.3" />
                    <g>
                      <rect x="320" y="520" width="160" height="60" rx="8" fill="#06B6D4" opacity="0.1" stroke="#06B6D4" strokeWidth="2" />
                      <text x="400" y="545" textAnchor="middle" className="text-sm font-semibold" fill="#1A1D2E">Action Potential</text>
                      <text x="400" y="565" textAnchor="middle" className="text-xs" fill="#64748B">Electrical Signals</text>
                    </g>
                  </svg>
                </div>
              </div>
            )}
            
            {activeTab === 1 && (
              // Flashcard - using same paper card style with grading buttons
              <div className="flex flex-col items-center justify-start min-h-[700px] pt-12">
                <div 
                  className="relative w-full max-w-2xl h-96 cursor-pointer mb-8"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className="relative w-full h-full transition-transform duration-600"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Front Side */}
                    <div
                      className="absolute inset-0 bg-white rounded-2xl border border-[#E2E8F0] p-8 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(15,23,42,0.12),0_2px_4px_rgba(15,23,42,0.08)]"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <p className="text-2xl text-[#1A1D2E] text-center">
                        What is the primary function of dendrites in a neuron?
                      </p>
                      <p className="text-sm text-[var(--text)] mt-6 flex items-center gap-2">
                        Click to flip <ChevronRight className="w-4 h-4" />
                      </p>
                    </div>

                    {/* Back Side */}
                    <div
                      className="absolute inset-0 bg-white rounded-2xl border border-[#5A5FF0]/30 p-8 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(90,95,240,0.12),0_2px_4px_rgba(90,95,240,0.08)]"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <p className="text-2xl text-[#1A1D2E] text-center mb-6">
                        Dendrites receive signals from other neurons and transmit them toward the cell body.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[var(--text)]">
                        <span className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full font-semibold">Medium</span>
                        <span>Due: Tomorrow</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grading Buttons - shown when flipped */}
                {isFlipped && (
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 w-full md:w-auto md:justify-center animate-in fade-in duration-300">
                    {/* Again Button */}
                    <button
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#FEF2F2] border-2 border-[#EF4444] text-[#EF4444] shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <span className="text-lg font-bold">Again</span>
                      <span className="text-xs opacity-75">&lt; 1 day</span>
                    </button>

                    {/* Hard Button */}
                    <button
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#F59E0B] shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <span className="text-lg font-bold">Hard</span>
                      <span className="text-xs opacity-75">1-3 days</span>
                    </button>

                    {/* Good Button */}
                    <button
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#DCFCE7] border-2 border-[#10B981] text-[#10B981] shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <span className="text-lg font-bold">Good</span>
                      <span className="text-xs opacity-75">4-7 days</span>
                    </button>

                    {/* Easy Button */}
                    <button
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl font-medium transition-all bg-white hover:bg-[#EEF2FF] border-2 border-[#5A5FF0] text-[#5A5FF0] shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <span className="text-lg font-bold">Easy</span>
                      <span className="text-xs opacity-75">7+ days</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 2 && (
              // Quiz - matching dashboard/review design
              <div className="min-h-[700px] flex items-start justify-center p-8 pt-12">
                <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-[0_4px_16px_rgba(15,23,42,0.12),0_2px_4px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#5A5FF0] text-white text-sm font-bold flex items-center justify-center">
                      1
                    </div>
                    <span className="text-sm text-[#64748B] font-medium">Question 1 of 10</span>
                  </div>
                  
                  <h3 className="text-2xl text-[#1A1D2E] mb-6 leading-relaxed font-semibold">
                    What are the main components of a neuron?
                  </h3>
                  
                  {/* MCQ Options */}
                  <div className="space-y-3 mb-6">
                    {['Dendrites, axon, and cell body', 'Nucleus, cytoplasm, and membrane', 'Synapse, vesicle, and receptor', 'Myelin, node, and terminal'].map((option, i) => (
                      <button
                        key={i}
                        className="w-full p-4 text-left bg-[#F8FAFB] hover:bg-[#EEF2FF] hover:border-[#5A5FF0] border border-[#E2E8F0] rounded-xl text-[#1A1D2E] transition-all"
                      >
                        <span className="font-semibold mr-3 text-[#5A5FF0]">{String.fromCharCode(65 + i)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  <button className="w-full px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-lg font-semibold rounded-xl shadow-sm transition-all">
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 3 && (
              // Summary - clean list style with note about comprehensive content
              <div className="min-h-[700px] flex items-start justify-center p-8 pt-12">
                <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-[0_4px_16px_rgba(15,23,42,0.12),0_2px_4px_rgba(15,23,42,0.08)]">
                  <h3 className="text-2xl font-bold text-[#1A1D2E] mb-2">Key Concepts</h3>
                  <p className="text-sm text-[#64748B] mb-6">Extracted highlights from your material</p>
                  <div className="space-y-4 mb-6">
                    {[
                      'Neurons are specialized cells that transmit electrical and chemical signals',
                      'Synapses are junctions where neurons communicate via neurotransmitters',
                      'Action potentials are rapid electrical signals that travel along axons',
                      'Different brain regions control specific functions and behaviors',
                      'Neurotransmitters like dopamine and serotonin regulate mood and behavior'
                    ].map((point, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#5A5FF0] mt-2 flex-shrink-0" />
                        <p className="text-base text-[#1A1D2E] leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-[#E2E8F0]">
                    <p className="text-sm text-[#64748B] italic">
                      Plus detailed notes, learning objectives, and more comprehensive content
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
