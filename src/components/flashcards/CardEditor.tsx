'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Flashcard } from '@/lib/types/flashcards'

interface CardEditorProps {
  card: Flashcard
  onClose: () => void
  onSave: (updatedCard: Flashcard) => void
}

export default function CardEditor({
  card,
  onClose,
  onSave,
}: CardEditorProps) {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    // Validate
    if (front.length < 10 || front.length > 150) {
      setError('Front text must be between 10 and 150 characters')
      return
    }
    if (back.length < 20 || back.length > 500) {
      setError('Back text must be between 20 and 500 characters')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch(`/api/flashcards/${card.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front, back }),
      })

      if (!response.ok) {
        throw new Error('Failed to update card')
      }

      const data = await response.json()
      onSave(data.card)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8 max-w-2xl w-full mx-4 shadow-2xl animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Flashcard</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Front */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Front (Question)
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#a8d5d5] focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter the question..."
              maxLength={150}
            />
            <p className="text-xs text-gray-400 mt-1">
              {front.length}/150 characters
            </p>
          </div>

          {/* Back */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Back (Answer)
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#a8d5d5] focus:border-transparent resize-none"
              rows={5}
              placeholder="Enter the answer..."
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">
              {back.length}/500 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#a8d5d5]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
