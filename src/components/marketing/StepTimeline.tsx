'use client'

import { UploadCloud, BrainCircuit, Flame, FileText } from 'lucide-react'

export default function StepTimeline() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-[40px] md:text-[56px] font-bold text-[#1A1D2E] mb-6 tracking-[-0.02em]">
            From chaos to <span className="text-[#5A5FF0]">exams ready.</span>
          </h2>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            Three simple steps. No complex setup. Just upload and start learning.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop Only - Approximate Path) */}
          <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 hidden lg:block opacity-20 pointer-events-none" viewBox="0 0 800 1000" fill="none">
            <path d="M400,100 C400,100 200,300 200,450 C200,600 600,600 600,750 C600,900 400,1100 400,1100" stroke="#5A5FF0" strokeWidth="4" strokeDasharray="12 12" />
          </svg>

          <div className="space-y-24 md:space-y-32">

            {/* Step 01: Upload */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative">
              <div className="flex-1 text-center lg:text-right order-2 lg:order-1">
                <div className="relative inline-block">
                  <span className="text-[120px] font-black text-[#F1F5F9] absolute -top-16 -right-12 -z-10 select-none">01</span>
                  <h3 className="text-3xl font-bold text-[#1A1D2E] mb-4 relative z-10">Upload anything</h3>
                </div>
                <p className="text-lg text-[#64748B] max-w-md ml-auto relative z-10">
                  Drag and drop your lecture slides, PDFs, or paste a YouTube link. We support messy notes too.
                </p>
              </div>

              <div className="flex-1 order-1 lg:order-2 flex justify-center lg:justify-start">
                {/* Visual Card */}
                <div className="relative w-64 h-64 bg-white rounded-[32px] border-2 border-[#1A1D2E] shadow-[8px_8px_0px_#1A1D2E] flex items-center justify-center group overflow-hidden transition-transform hover:scale-105">
                  <div className="absolute inset-0 bg-[#F8FAFB] opacity-50" />
                  {/* Animated file dropping */}
                  <div className="relative z-10 flex flex-col items-center animate-bounce-slow">
                    <div className="w-20 h-24 bg-white border-2 border-[#64748B] rounded-lg flex items-center justify-center shadow-sm mb-4">
                      <FileText className="w-8 h-8 text-[#5A5FF0]" />
                    </div>
                    <div className="px-4 py-2 bg-[#1A1D2E] text-white rounded-full text-sm font-bold flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      <span>Drop PDF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 02: Analyze */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative">
              <div className="flex-1 flex justify-center lg:justify-end order-1">
                {/* Visual Card */}
                <div className="relative w-64 h-64 bg-[#1A1D2E] rounded-[32px] shadow-[8px_8px_0px_#94A3B8] flex items-center justify-center group transition-transform hover:scale-105">
                  {/* Pulse Rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border border-[#5A5FF0]/30 rounded-full animate-ping" />
                    <div className="absolute w-32 h-32 border border-[#5A5FF0]/50 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                  </div>

                  <div className="relative z-10 text-center">
                    <BrainCircuit className="w-16 h-16 text-[#5A5FF0] mb-4 mx-auto" />
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-white/80">
                      Processing...
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left order-2">
                <div className="relative inline-block">
                  <span className="text-[120px] font-black text-[#F1F5F9] absolute -top-16 -left-12 -z-10 select-none">02</span>
                  <h3 className="text-3xl font-bold text-[#1A1D2E] mb-4 relative z-10">Instant Analysis</h3>
                </div>
                <p className="text-lg text-[#64748B] max-w-md relative z-10">
                  In seconds, Sappio breaks down your material into atomic concepts, connecting them into a knowledge graph.
                </p>
              </div>
            </div>

            {/* Step 03: Master */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative">
              <div className="flex-1 text-center lg:text-right order-2 lg:order-1">
                <div className="relative inline-block">
                  <span className="text-[120px] font-black text-[#F1F5F9] absolute -top-16 -right-12 -z-10 select-none">03</span>
                  <h3 className="text-3xl font-bold text-[#1A1D2E] mb-4 relative z-10">Master it faster</h3>
                </div>
                <p className="text-lg text-[#64748B] max-w-md ml-auto relative z-10">
                  Start your daily streak. The spaced repetition algorithm ensures you only review what you&apos;re about to forget.
                </p>
              </div>

              <div className="flex-1 order-1 lg:order-2 flex justify-center lg:justify-start">
                {/* Visual Card */}
                <div className="relative w-64 h-64 bg-white rounded-[32px] border-2 border-[#10B981] shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] flex items-center justify-center group overflow-hidden transition-transform hover:scale-105">
                  {/* Confetti Background (Simulated) */}
                  <div className="absolute top-4 right-8 w-2 h-2 bg-[#F59E0B] rounded-full" />
                  <div className="absolute bottom-8 left-6 w-2 h-2 bg-[#5A5FF0] rounded-full" />

                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Flame className="w-10 h-10 text-[#10B981]" />
                    </div>
                    <h4 className="text-2xl font-black text-[#1A1D2E] mb-1">98%</h4>
                    <span className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">Retention</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
