'use client'

import { motion } from 'framer-motion'
import { Repeat, Brain, FileText, Trophy, MoreHorizontal } from 'lucide-react'

const features = [
  {
    title: 'Spaced Repetition',
    desc: 'Tracks your forgetting curve.',
    icon: Repeat,
    visual: (
      <div className="w-full h-full p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Schedule</div>
          <div className="p-1 bg-green-100 text-green-700 rounded text-xs font-bold">On Track</div>
        </div>
        {/* Calendar Grid Mockup */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => {
            // Generate a random visual heatmap
            const opacity = [0.1, 0.2, 0.4, 0.8, 0.3, 0.1, 0.9][i % 7]
            return (
              <div key={i} className="aspect-square rounded-sm bg-[#5A5FF0]" style={{ opacity: opacity }} />
            )
          })}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#5A5FF0] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            24
          </div>
          <div className="text-sm font-medium text-slate-600">Cards due today</div>
        </div>
      </div>
    )
  },
  {
    title: 'Smart Mind Maps',
    desc: 'Connects the dots for you.',
    icon: Brain,
    visual: (
      <div className="w-full h-full relative overflow-hidden bg-slate-50/50">
        {/* Center Node */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-900 whitespace-nowrap">
            Central Concept
          </div>
        </div>

        {/* Connected Nodes */}
        <div className="absolute top-1/4 left-1/4 animate-float-slow">
          <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-[10px] font-medium text-slate-600">
            Subtopic A
          </div>
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-float-delayed">
          <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-[10px] font-medium text-slate-600">
            Subtopic B
          </div>
        </div>

        {/* Connectors (CSS Only Lines via Borders/Rotation could be complex, simple SVG is better) */}
        <svg className="absolute inset-0 pointer-events-none -z-0 opacity-20">
          <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="currentColor" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="75%" y2="66%" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    )
  },
  {
    title: 'Instant Summaries',
    desc: 'Lectures turned into cheat sheets.',
    icon: FileText,
    visual: (
      <div className="w-full h-full p-6">
        <div className="w-full h-full bg-white rounded shadow-sm border border-slate-100 p-4 space-y-3">
          <div className="h-2 w-1/3 bg-slate-900/10 rounded" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-[#F59E0B]/10 rounded" />
            <div className="h-1.5 w-full bg-[#F59E0B]/10 rounded" />
            <div className="h-1.5 w-2/3 bg-slate-100 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-slate-100 rounded" />
            <div className="h-1.5 w-5/6 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Exam Simulator',
    desc: 'Practice with real questions.',
    icon: Trophy,
    visual: (
      <div className="w-full h-full p-6 flex flex-col justify-center">
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-slate-300" />
              <div className="h-2 w-24 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="p-3 rounded-lg border border-[#10B981] bg-green-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-[4px] border-[#10B981]" />
              <div className="h-2 w-32 bg-slate-900/10 rounded" />
            </div>
            <div className="text-xs font-bold text-[#10B981]">Correct</div>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-slate-300" />
              <div className="h-2 w-20 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }
]

export default function WhatYouGet() {
  return (
    <section id="features" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#F8FAFB]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[40px] md:text-[56px] font-bold text-[#1A1D2E] mb-6 tracking-[-0.02em] leading-tight">
            Stop switching apps.
          </h2>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            Everything in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-[320px] flex flex-col"
            >
              {/* Window Header */}
              <div className="h-10 border-b border-[#F1F5F9] bg-white flex items-center justify-between px-4 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-[#EF4444] transition-colors" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-[#F59E0B] transition-colors" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-[#10B981] transition-colors" />
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-300" />
              </div>

              <div className="flex-1 flex flex-col md:flex-row">
                {/* Content Side */}
                <div className="p-8 flex flex-col justify-center md:w-1/2 z-10 relative bg-white">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center mb-4 text-[#5A5FF0]">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1D2E] mb-2">{feature.title}</h3>
                  <p className="text-[#64748B] font-medium leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* Visual Side */}
                <div className="md:w-1/2 bg-slate-50 border-l border-[#F1F5F9] relative overflow-hidden group-hover:bg-slate-50/80 transition-colors">
                  {feature.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
