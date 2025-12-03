'use client'

import { useState, useEffect } from 'react'
import { Upload, Check, Sparkles } from 'lucide-react'
import BookmarkCorner from './BookmarkNotch'

export default function HeroPreviewCard() {
  const [progress, setProgress] = useState(0)
  const [showOutputs, setShowOutputs] = useState([false, false, false])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 20)

    const timers = [
      setTimeout(() => setShowOutputs([true, false, false]), 900),
      setTimeout(() => setShowOutputs([true, true, false]), 1400),
      setTimeout(() => setShowOutputs([true, true, true]), 1900)
    ]

    return () => {
      clearInterval(progressInterval)
      timers.forEach(t => clearTimeout(t))
    }
  }, [])

  return (
    <div className="relative">
      <BookmarkCorner size="md" />
      
      <div 
        className="bg-white rounded-2xl p-8 border border-[var(--border)] transition-all duration-200"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--ink)]">Create Study Pack</h3>
        </div>
        
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border)]">
          <div className="w-9 h-9 rounded-lg bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
            <Upload className="w-4 h-4 text-[var(--text)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--ink)] truncate">
              lecture_notes.pdf
            </p>
            <p className="text-xs text-[var(--text)]">2.4 MB</p>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          {[
            { label: 'Flashcards', count: '45 cards', color: 'var(--primary)', show: showOutputs[0] },
            { label: 'Quiz', count: '10 questions', color: 'var(--accent)', show: showOutputs[1] },
            { label: 'Summary', count: 'Key concepts', color: '#F59E0B', show: showOutputs[2] }
          ].map((output, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${
                output.show 
                  ? 'bg-[var(--bg)] border-[var(--border)] opacity-100 translate-y-0' 
                  : 'bg-transparent border-transparent opacity-0 translate-y-2'
              }`}
            >
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${output.color}15` }}
              >
                <Check className="w-4 h-4" style={{ color: output.color }} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-[var(--ink)]">{output.label}</span>
                <span className="text-xs ml-2 text-[var(--text)]">{output.count}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text)]">Processing</span>
            <span className="text-xs font-semibold text-[var(--ink)]">{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
