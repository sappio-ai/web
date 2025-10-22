'use client'

import { useState } from 'react'
import CreatePackModal from '@/components/materials/CreatePackModal'
import { Package } from 'lucide-react'

interface DashboardClientProps {
    userData: any
    children: React.ReactNode
}

export default function DashboardClient({
    userData,
    children,
}: DashboardClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <CreatePackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="min-h-screen bg-[#0A0F1A] relative overflow-hidden">
                {/* Animated Background Gradients */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a8d5d5]/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f5e6d3]/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#a8d5d5]/5 to-[#f5e6d3]/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Create Pack CTA */}
                    <div className="mb-12 animate-in slide-in-from-bottom duration-700">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#a8d5d5] via-[#8bc5c5] to-[#f5e6d3] rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-500 animate-pulse" />
                            <div className="relative bg-gradient-to-br from-[#a8d5d5]/20 to-[#8bc5c5]/20 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-[#a8d5d5]/30 shadow-2xl overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f5e6d3]/20 to-transparent rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#a8d5d5]/20 to-transparent rounded-full blur-3xl" />

                                <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex-1 text-center sm:text-left">
                                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                                            Create Your First Study Pack
                                        </h2>
                                        <p className="text-gray-300 text-lg mb-2">
                                            Upload PDFs, documents, or paste URLs to generate AI-powered study materials
                                        </p>
                                        <p className="text-[#a8d5d5] text-sm font-medium">
                                            ✨ Get flashcards, quizzes, notes, and mind maps in seconds
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="group/btn relative flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] font-bold text-lg text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#a8d5d5]/50 active:scale-95"
                                    >
                                        <Package className="w-6 h-6 transition-transform group-hover/btn:rotate-12" />
                                        <span>Create Pack</span>
                                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Server-rendered content */}
                    {children}
                </div>
            </div>
        </>
    )
}
