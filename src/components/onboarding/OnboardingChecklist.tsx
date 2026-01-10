'use client'

import { CheckCircle2, Circle, PartyPopper } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'

interface OnboardingChecklistProps {
    progress: {
        has_created_pack: boolean
        has_reviewed_flashcards: boolean
        has_taken_quiz: boolean
    }
}

export default function OnboardingChecklist({ progress }: OnboardingChecklistProps) {
    const [showConfetti, setShowConfetti] = useState(false)

    const steps = [
        {
            id: 'create',
            label: 'Create your first study pack',
            completed: progress.has_created_pack,
        },
        {
            id: 'review',
            label: 'Review 5 flashcards',
            completed: progress.has_reviewed_flashcards,
        },
        {
            id: 'quiz',
            label: 'Take a practice quiz',
            completed: progress.has_taken_quiz,
        }
    ]

    const completedCount = steps.filter(s => s.completed).length
    const totalCount = steps.length
    const isAllComplete = completedCount === totalCount

    useEffect(() => {
        if (isAllComplete && !showConfetti) {
            setShowConfetti(true)
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        }
    }, [isAllComplete, showConfetti])

    if (isAllComplete) return null // Hide after completion or show a "Graduate" card

    return (
        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] mb-8 overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#5A5FF0]/5 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-[18px] font-bold text-[#1A1D2E]">Getting Started</h3>
                    <p className="text-[13px] text-[#64748B]">Complete these steps to become a pro studier</p>
                </div>
                <div className="text-[13px] font-semibold text-[#5A5FF0] bg-[#5A5FF0]/10 px-3 py-1 rounded-full">
                    {completedCount}/{totalCount}
                </div>
            </div>

            <div className="space-y-3">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step.completed ? 'bg-[#F0FDF4] border border-[#DCFCE7]' : 'bg-[#F8FAFB] border border-[#F1F5F9]'
                            }`}
                    >
                        {step.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                        ) : (
                            <Circle className="w-5 h-5 text-[#94A3B8]" />
                        )}
                        <span className={`text-[14px] ${step.completed ? 'text-[#15803D] line-through opacity-75' : 'text-[#334155]'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
