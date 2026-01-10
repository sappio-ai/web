'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, MessageSquare, Bug, Lightbulb, Send, Loader2 } from 'lucide-react'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
}

type FeedbackType = 'bug' | 'feature' | 'general'

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [type, setType] = useState<FeedbackType>('general')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!message.trim()) {
            setError('Please enter your feedback')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message: message.trim(),
                    pageUrl: window.location.href,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to submit feedback')
            }

            setSubmitted(true)
            setTimeout(() => {
                onClose()
                setTimeout(() => {
                    setSubmitted(false)
                    setMessage('')
                    setType('general')
                }, 300)
            }, 2000)
        } catch (err) {
            setError('Failed to submit. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen || !mounted) return null

    const modalContent = (
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                style={{ zIndex: 9998 }}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md bg-white rounded-xl shadow-2xl"
                style={{ zIndex: 9999 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
                    <h2 className="text-lg font-semibold text-[#1A1D2E]">Send Feedback</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                    >
                        <X className="w-5 h-5 text-[#64748B]" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1A1D2E] mb-2">Thank you!</h3>
                        <p className="text-[#64748B]">Your feedback helps us improve Sappio.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4">
                        {/* Type Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#1A1D2E] mb-2">
                                Type of feedback
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType('bug')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${type === 'bug'
                                        ? 'border-red-400 bg-red-50 text-red-600'
                                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
                                        }`}
                                >
                                    <Bug className="w-5 h-5" />
                                    <span className="text-xs font-medium">Bug</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('feature')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${type === 'feature'
                                        ? 'border-purple-400 bg-purple-50 text-purple-600'
                                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
                                        }`}
                                >
                                    <Lightbulb className="w-5 h-5" />
                                    <span className="text-xs font-medium">Feature</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('general')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${type === 'general'
                                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
                                        }`}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="text-xs font-medium">General</span>
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#1A1D2E] mb-2">
                                Your message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    type === 'bug'
                                        ? "Describe what happened and what you expected..."
                                        : type === 'feature'
                                            ? "What feature would make Sappio better for you?"
                                            : "Share your thoughts..."
                                }
                                rows={4}
                                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[#1A1D2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:border-[#5A5FF0] resize-none"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mb-4">{error}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Feedback
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )

    // Use portal to render at document body level
    return createPortal(modalContent, document.body)
}
