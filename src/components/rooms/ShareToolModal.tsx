'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ToolType } from '@/lib/types/rooms'

interface StudyPack {
  id: string
  title: string
  summary: string | null
  stats_json: {
    flashcard_count?: number
    quiz_count?: number
  } | null
}

interface ShareToolModalProps {
  isOpen: boolean
  toolType: ToolType
  onClose: () => void
  onShare: (packId: string, packTitle: string) => void
}

const toolLabels: Record<ToolType, string> = {
  quiz: 'Quiz',
  flashcards: 'Flashcards',
  notes: 'Notes',
}

const toolIcons: Record<ToolType, string> = {
  quiz: '📝',
  flashcards: '🃏',
  notes: '📄',
}

export default function ShareToolModal({
  isOpen,
  toolType,
  onClose,
  onShare,
}: ShareToolModalProps) {
  const [packs, setPacks] = useState<StudyPack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchPacks()
    }
  }, [isOpen])

  const fetchPacks = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/study-packs?limit=100')
      if (!response.ok) throw new Error('Failed to fetch study packs')
      const data = await response.json()
      setPacks(data.packs || [])
    } catch (err) {
      setError('Failed to load study packs')
      console.error('Error fetching packs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (!selectedPackId) return
    const pack = packs.find(p => p.id === selectedPackId)
    if (pack) {
      onShare(pack.id, pack.title)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#1A1D2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{toolIcons[toolType]}</span>
            <h2 className="text-lg font-semibold text-white">
              Share {toolLabels[toolType]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#5A5FF0] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchPacks}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No study packs found</p>
              <p className="text-white/40 text-sm mt-2">
                Create a study pack first to share it
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-white/50 mb-4">
                Select a study pack to share its {toolLabels[toolType].toLowerCase()}
              </p>
              {packs.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    selectedPackId === pack.id
                      ? 'bg-[#5A5FF0]/20 border-[#5A5FF0]/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5A5FF0] to-[#8B5CF6] flex items-center justify-center text-white text-lg">
                    📚
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white font-medium truncate">{pack.title}</p>
                    {pack.summary && (
                      <p className="text-white/50 text-sm truncate">{pack.summary}</p>
                    )}
                  </div>
                  {selectedPackId === pack.id && (
                    <div className="w-5 h-5 rounded-full bg-[#5A5FF0] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-white/70 hover:text-white text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedPackId}
            className="px-6 py-2.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Share {toolLabels[toolType]}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
