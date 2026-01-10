import { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import DotPattern from '@/components/ui/DotPattern'

export const metadata: Metadata = {
    title: 'About | Sappio',
    description: 'Learn about Sappio - the AI-powered study companion.',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFB] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-10 bg-[#F8FAFB]">
                <DotPattern className="opacity-[0.15] fill-[#1A1D2E]" width={32} height={32} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F8FAFB_100%)]" />
            </div>

            {/* Hero */}
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm mb-8">
                        <Sparkles className="w-4 h-4 text-[#5A5FF0]" />
                        <span className="text-sm font-semibold text-[#1A1D2E]">About Sappio</span>
                    </div>

                    <h1 className="text-[48px] md:text-[64px] leading-[1.1] font-bold text-[#1A1D2E] tracking-[-0.02em] mb-6">
                        We help students{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10">study smarter</span>
                            <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#FFDE59] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.8" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-xl text-[#334155] max-w-2xl mx-auto leading-relaxed font-medium">
                        Sappio transforms your study materials into AI-powered flashcards, quizzes, and mind maps—so you spend less time preparing and more time actually learning.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border-2 border-[#1A1D2E] p-8 md:p-12 relative">
                        <div className="absolute inset-0 bg-[#1A1D2E] rounded-2xl translate-y-2 translate-x-2 -z-10" />

                        <h2 className="text-2xl md:text-3xl font-bold text-[#1A1D2E] mb-6">The Problem We Solve</h2>

                        <div className="space-y-4 text-[#1A1D2E] text-lg leading-relaxed font-medium">
                            <p>
                                Creating effective study materials takes forever. You spend hours highlighting notes,
                                manually making flashcards, and organizing content—time that could be spent actually studying.
                            </p>
                            <p>
                                <strong className="text-[#1A1D2E] font-bold">Sappio fixes this.</strong> Upload your lecture slides or PDFs,
                                and our AI generates exam-ready study materials in seconds. We handle the busywork so you
                                can focus on what matters: understanding and retaining the material.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E2E8F0] relative z-10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1A1D2E] mb-12 text-center">How It Works</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#5A5FF0] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-lg font-bold text-[#1A1D2E] mb-2">Upload</h3>
                            <p className="text-[#334155]">
                                Drop in your lecture slides, PDFs, or notes. We support all major formats.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#5A5FF0] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-lg font-bold text-[#1A1D2E] mb-2">Generate</h3>
                            <p className="text-[#334155]">
                                Our AI creates flashcards, quizzes, and mind maps from your content in seconds.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#5A5FF0] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-lg font-bold text-[#1A1D2E] mb-2">Study</h3>
                            <p className="text-[#334155]">
                                Use spaced repetition to master the material efficiently before your exam.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-[#1A1D2E] mb-4">Ready to try it?</h2>
                    <p className="text-lg text-[#334155] mb-8 font-medium">
                        Join students who are already studying smarter with Sappio.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#5A5FF0] text-white font-bold rounded-xl hover:bg-[#4A4FD0] transition-colors"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#1A1D2E] font-bold border-2 border-[#1A1D2E] rounded-xl hover:bg-[#F8FAFB] transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
