'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PaywallModal } from '@/components/paywall/PaywallModal'

interface CreateCardModalProps {
  isOpen: boolean
  onClose: () => void
  packId: string
  existingTopics: string[]
  userPlan: string
  onCardCreated: () => void
}

export default function CreateCardModal({
  isOpen,
  onClose,
  packId,
  existingTopics,
  userPlan,
  onCardCreated,
}: CreateCardModalProps) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedFront = front.trim()
    const trimmedBack = back.trim()

    if (trimmedFront.length < 10) {
      setError('Front must be at least 10 characters')
      return
    }
    if (trimmedFront.length > 500) {
      setError('Front must be at most 500 characters')
      return
    }
    if (trimmedBack.length < 10) {
      setError('Back must be at least 10 characters')
      return
    }
    if (trimmedBack.length > 1000) {
      setError('Back must be at most 1000 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/study-packs/${packId}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front: trimmedFront,
          back: trimmedBack,
          topic: topic || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create card')
        return
      }

      // Success - reset form and close
      setFront('')
      setBack('')
      setTopic('')
      onCardCreated()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFront('')
    setBack('')
    setTopic('')
    setError('')
    onClose()
  }

  const modal = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal Card */}
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
            <h2 className="text-[18px] font-bold text-[#1A1D2E]">Add Card</h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <X className="w-5 h-5 text-[#64748B]" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {userPlan === 'free' ? (
              /* Upgrade Prompt for free users */
              <div className="text-center py-6">
                <div className="text-[48px] mb-4">&#128274;</div>
                <h3 className="text-[16px] font-bold text-[#1A1D2E] mb-2">
                  Upgrade to Create Cards
                </h3>
                <p className="text-[14px] text-[#64748B] mb-6">
                  Manual card creation is available on Student Pro and Pro Plus plans.
                </p>
                <button
                  onClick={() => setShowPaywall(true)}
                  className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[14px] font-semibold rounded-lg transition-colors"
                >
                  View Plans
                </button>
              </div>
            ) : (
              /* Card Creation Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Front */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1A1D2E] mb-1.5">
                    Front
                  </label>
                  <textarea
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="Question or prompt"
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1A1D2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/30 focus:border-[#5A5FF0] resize-none transition-colors"
                  />
                  <div className="text-[12px] text-[#94A3B8] mt-1 text-right">
                    {front.trim().length}/500
                  </div>
                </div>

                {/* Back */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1A1D2E] mb-1.5">
                    Back
                  </label>
                  <textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="Answer"
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1A1D2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/30 focus:border-[#5A5FF0] resize-none transition-colors"
                  />
                  <div className="text-[12px] text-[#94A3B8] mt-1 text-right">
                    {back.trim().length}/1000
                  </div>
                </div>

                {/* Topic */}
                {existingTopics.length > 0 && (
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1A1D2E] mb-1.5">
                      Topic (optional)
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1A1D2E] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/30 focus:border-[#5A5FF0] bg-white transition-colors"
                    >
                      <option value="">No topic</option>
                      {existingTopics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] disabled:bg-[#5A5FF0]/50 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add Card'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          trigger="general"
          currentPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
        />
      )}
    </>
  )

  if (typeof window === 'undefined') return null
  return createPortal(modal, document.body)
}
