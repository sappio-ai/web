'use client'

import { useState } from 'react'
import { Check, Clock, Star, ChevronRight, Sparkles } from 'lucide-react'
import DotPattern from '@/components/ui/DotPattern'
import { motion, AnimatePresence } from 'framer-motion'

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
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#F8FAFB] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <DotPattern className="opacity-[0.15] fill-[var(--ink)]" width={32} height={32} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F8FAFB_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#5A5FF0]" />
            <span className="text-sm font-semibold text-[#1A1D2E]">One click generation</span>
          </div>
          <h2 className="text-[40px] md:text-[56px] font-bold text-[#1A1D2E] mb-6 tracking-[-0.02em]">
            See exactly what you get
          </h2>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Flashcards, quizzes, summaries, and mind maps generated from your material.
          </p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
          {/* Left: Tabs + bullets */}
          <div className="sticky top-24">
            {/* Tabs */}
            <div className="flex flex-col gap-3 mb-8">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveTab(i)
                    setIsFlipped(false)
                  }}
                  className={`relative px-6 py-4 text-left text-base font-bold rounded-xl transition-all duration-300 ${activeTab === i
                    ? 'bg-[#1A1D2E] text-white shadow-lg translate-x-2'
                    : 'bg-white text-[#64748B] hover:bg-gray-50 border border-[#E2E8F0] hover:border-[#94A3B8]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tab.label}</span>
                    {activeTab === i && <ChevronRight className="w-5 h-5 text-[#5A5FF0]" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Bullets */}
            <div className="space-y-4 mb-8 pl-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {tabs[activeTab].bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#5A5FF0]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#5A5FF0]" strokeWidth={3} />
                      </div>
                      <p className="text-base text-[#1A1D2E] font-medium">{bullet}</p>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Proof row */}
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-sm">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[#64748B]">
                  <span className="font-bold text-[#1A1D2E] uppercase text-xs tracking-wider">Generated from:</span>
                  <span className="truncate flex-1 font-mono text-xs bg-[#F8FAFB] px-2 py-1 rounded border border-[#E2E8F0]">
                    {tabs[activeTab].proof.file}
                  </span>
                </div>
                <div className="flex items-center gap-6 pt-2 border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#94A3B8]" />
                    <span className="font-bold text-[#1A1D2E]">{tabs[activeTab].proof.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="font-bold text-[#1A1D2E]">{tabs[activeTab].proof.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Big demo preview */}
          <div className="relative isolate group">
            {/* Paper Stack Effect */}
            <div className="absolute top-[8px] left-[8px] right-[-8px] bottom-[-8px] bg-white rounded-2xl border border-[#94A3B8]/20 -z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
            <div className="absolute top-[16px] left-[16px] right-[-16px] bottom-[-16px] bg-white/40 rounded-2xl border border-[#94A3B8]/20 -z-20 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />

            {activeTab === 0 && (
              // Mind map
              <div className="min-h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden relative p-8">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #0F172A 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
                <div className="h-full w-full flex items-center justify-center">
                  {/* SVG Mind Map (Same as before but cleaned up) */}
                  <svg className="w-full h-full" viewBox="0 0 800 600">
                    {/* Connecting Lines */}
                    <path d="M400,300 L250,150" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />
                    <path d="M400,300 L550,150" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />
                    <path d="M400,300 L400,450" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />

                    {/* Central Node */}
                    <g>
                      <rect x="300" y="260" width="200" height="80" rx="40" fill="#fff" stroke="#1A1D2E" strokeWidth="2" className="shadow-lg" />
                      <text x="400" y="305" textAnchor="middle" className="text-xl font-bold" fill="#1A1D2E">Neuroscience</text>
                      <circle cx="400" cy="300" r="120" fill="none" stroke="#5A5FF0" strokeWidth="1" opacity="0.1" className="animate-pulse" />
                    </g>

                    {/* Nodes */}
                    <g transform="translate(150, 110)">
                      <rect x="0" y="0" width="160" height="60" rx="12" fill="#fff" stroke="#5A5FF0" strokeWidth="2" />
                      <text x="80" y="35" textAnchor="middle" className="text-sm font-bold" fill="#1A1D2E">Neurons</text>
                    </g>

                    <g transform="translate(490, 110)">
                      <rect x="0" y="0" width="160" height="60" rx="12" fill="#fff" stroke="#10B981" strokeWidth="2" />
                      <text x="80" y="35" textAnchor="middle" className="text-sm font-bold" fill="#1A1D2E">Synapses</text>
                    </g>

                    <g transform="translate(320, 450)">
                      <rect x="0" y="0" width="160" height="60" rx="12" fill="#fff" stroke="#F59E0B" strokeWidth="2" />
                      <text x="80" y="35" textAnchor="middle" className="text-xs font-bold" fill="#1A1D2E">Neurotransmitters</text>
                    </g>
                  </svg>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              // Flashcard
              <div className="min-h-[600px] bg-[#F8FAFB] rounded-2xl border border-[#E2E8F0] shadow-xl p-8 flex items-center justify-center">
                <div
                  className="relative w-full max-w-lg aspect-[3/2] cursor-pointer perspective-1000"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 bg-white rounded-2xl border-2 border-[#1A1D2E] shadow-[4px_4px_0px_#1A1D2E] flex flex-col items-center justify-center p-8 backface-hidden">
                      <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Question</span>
                      <p className="text-2xl font-bold text-[#1A1D2E] text-center">What is the primary function of dendrites?</p>
                      <span className="mt-8 text-sm text-[#5A5FF0] font-medium flex items-center gap-2">
                        Click to reveal <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-[#1A1D2E] rounded-2xl border-2 border-[#1A1D2E] shadow-[4px_4px_0px_#94A3B8] flex flex-col items-center justify-center p-8 backface-hidden [transform:rotateY(180deg)]">
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Answer</span>
                      <p className="text-xl font-medium text-white text-center leading-relaxed">
                        To receive electrical signals from other neurons and transmit them toward the cell body.
                      </p>
                      <div className="mt-8 flex gap-2">
                        {['Hard', 'Good', 'Easy'].map((label, i) => (
                          <button key={i} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors">
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              // Quiz
              <div className="min-h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-sm font-bold text-[#1A1D2E]">Quiz Mode</span>
                  </div>
                  <span className="text-sm font-mono text-[#64748B]">01/10</span>
                </div>

                <h3 className="text-2xl font-bold text-[#1A1D2E] mb-8">Which neurotransmitter is primarily associated with reward and motivation?</h3>

                <div className="space-y-3">
                  {['Serotonin', 'Dopamine', 'Acetylcholine', 'GABA'].map((opt, i) => (
                    <div key={i} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${i === 1 ? 'border-[#5A5FF0] bg-[#5A5FF0]/5' : 'border-[#E2E8F0] hover:border-[#94A3B8]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${i === 1 ? 'border-[#5A5FF0] bg-[#5A5FF0]' : 'border-[#CBD5E1]'}`}>
                          {i === 1 && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`font-medium ${i === 1 ? 'text-[#1A1D2E]' : 'text-[#64748B]'}`}>{opt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <button className="w-full py-4 bg-[#1A1D2E] text-white rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-lg">
                    Next Question
                  </button>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              // Summary
              <div className="min-h-[600px] bg-[#FFFFF0] rounded-2xl border border-[#E2E8F0] shadow-xl p-8 md:p-12 relative overflow-hidden">
                {/* Yellow Pad Lines */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '100% 40px', marginTop: '40px' }} />
                <div className="absolute top-0 left-12 bottom-0 w-[2px] bg-[#EF4444] opacity-20" />

                <div className="relative z-10 font-mono text-[#1A1D2E]">
                  <h3 className="text-3xl font-bold mb-8 tracking-tight">Lecture Summary</h3>

                  <div className="space-y-8 pl-8">
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-[#5A5FF0]">1. Introduction to Neurons</h4>
                      <p className="text-base leading-loose">
                        Neurons are the fundamental units of the brain and nervous system. They are responsible for receiving sensory input from the external world.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-[#5A5FF0]">2. Signal Transmission</h4>
                      <p className="text-base leading-loose">
                        Signals are transmitted electrically within neurons and chemically between them. This process is known as electrochemical signaling.
                      </p>
                    </div>
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
