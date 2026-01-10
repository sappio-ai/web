'use client'

import Orb from '@/components/orb/Orb'
import { Sparkles, Plus, X } from 'lucide-react'

interface WelcomeModalProps {
    isOpen: boolean
    userName?: string
    onClose: () => void
    onCreatePack: () => void
}

export default function WelcomeModal({
    isOpen,
    userName,
    onClose,
    onCreatePack,
}: WelcomeModalProps) {
    if (!isOpen) return null

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onClose()
    }

    const handleCreatePack = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onCreatePack()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-300">
                {/* Paper stack effect */}
                <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-2xl border border-[#94A3B8]/25" />

                <div className="relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)] border border-[#CBD5E1] overflow-hidden">

                    {/* Decorative Background */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#F0F9FF] to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A5FF0]/5 rounded-bl-[80px] pointer-events-none" />

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute right-4 top-4 p-2 rounded-lg hover:bg-black/5 text-[#64748B] hover:text-[#1A1D2E] transition-colors z-10"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative p-8 text-center">
                        {/* Mascot */}
                        <div className="mb-6 inline-block relative">
                            <Orb pose="welcome-wave" size="lg" className="w-24 h-24" />
                            <div className="absolute -bottom-2 inset-x-0 h-4 bg-[#5A5FF0]/20 blur-xl rounded-full" />
                        </div>

                        {/* Heading */}
                        <h1 className="text-[28px] font-bold text-[#1A1D2E] mb-3 tracking-[-0.02em] leading-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                            Welcome to Sappio{userName ? `, ${userName}` : ''}! 🎉
                        </h1>

                        <p className="text-[16px] text-[#64748B] mb-8 leading-relaxed max-w-sm mx-auto">
                            You&apos;re all set to transform your study materials into exam-ready flashcards, quizzes, and more.
                        </p>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleCreatePack}
                                className="w-full group relative overflow-hidden rounded-xl bg-[#5A5FF0] hover:bg-[#4A4FD0] px-6 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#5A5FF0]/25 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2 active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className="bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors">
                                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[16px]">Create My First Study Pack</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full px-6 py-4 rounded-xl font-semibold text-[#64748B] hover:text-[#1A1D2E] hover:bg-[#F1F5F9] transition-all focus:outline-none focus:ring-2 focus:ring-[#CBD5E1] active:scale-[0.98]"
                            >
                                I&apos;ll Explore First
                            </button>
                        </div>

                        {/* Quick Tips */}
                        <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-left">
                            <div className="flex items-start gap-3 bg-[#F8FAFB] p-4 rounded-xl border border-[#E2E8F0]/50">
                                <div className="bg-[#FEF3C7] p-1.5 rounded-lg text-[#D97706] flex-shrink-0">
                                    <Sparkles className="w-4 h-4 fill-current" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#1A1D2E] mb-0.5">Magic in 60 seconds</p>
                                    <p className="text-[13px] text-[#64748B] leading-relaxed">
                                        Upload any PDF, Doc, or paste a URL. Our AI will instantly generate your complete study pack.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
