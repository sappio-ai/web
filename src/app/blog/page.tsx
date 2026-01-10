import Link from 'next/link'
import { Metadata } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { ArrowRight, Sparkles } from 'lucide-react'
import DotPattern from '@/components/ui/DotPattern'

export const metadata: Metadata = {
    title: 'Blog | Sappio',
    description: 'Learn about effective study techniques, AI in education, and learning science.',
}

export default function BlogIndexPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFB] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-10 bg-[#F8FAFB]">
                <DotPattern className="opacity-[0.15] fill-[#1A1D2E]" width={32} height={32} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F8FAFB_100%)]" />
            </div>

            {/* Header */}
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm mb-8">
                        <Sparkles className="w-4 h-4 text-[#5A5FF0]" />
                        <span className="text-sm font-semibold text-[#1A1D2E]">The Sappio Blog</span>
                    </div>

                    <h1 className="text-[48px] md:text-[64px] leading-[1.1] font-bold text-[#1A1D2E] tracking-[-0.02em] mb-6">
                        Learn How to{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10">Learn Better</span>
                            <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#FFDE59] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.8" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-xl text-[#1A1D2E] max-w-2xl mx-auto font-medium">
                        Explore the science of learning, study techniques, and how AI is transforming education.
                    </p>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="space-y-6">
                        {blogPosts.map((post, index) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group block relative"
                            >
                                <div className="absolute inset-0 bg-[#1A1D2E] rounded-2xl translate-y-1 translate-x-1 transition-transform group-hover:translate-y-2 group-hover:translate-x-2" />
                                <div className="relative bg-white rounded-2xl border-2 border-[#1A1D2E] p-6 md:p-8 transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                                        {/* Number */}
                                        <div className="w-12 h-12 rounded-xl bg-[#5A5FF0] text-white text-xl font-bold flex items-center justify-center shrink-0">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 text-xs font-bold bg-[#F8FAFB] text-[#5A5FF0] rounded-full border border-[#E2E8F0]">
                                                    {post.category}
                                                </span>
                                                <span className="text-sm text-[#1A1D2E] font-bold">
                                                    {post.readTime}
                                                </span>
                                            </div>

                                            <h2 className="text-xl md:text-2xl font-bold text-[#1A1D2E] mb-2 group-hover:text-[#5A5FF0] transition-colors">
                                                {post.title}
                                            </h2>

                                            <p className="text-[#1A1D2E] text-lg line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#F8FAFB] border border-[#E2E8F0] group-hover:bg-[#5A5FF0] group-hover:border-[#5A5FF0] transition-colors shrink-0">
                                            <ArrowRight className="w-5 h-5 text-[#1A1D2E] group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E2E8F0] relative z-10">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-[#1A1D2E] mb-4">Ready to study smarter?</h2>
                    <p className="text-lg text-[#1A1D2E] mb-8 font-medium">
                        Turn your study materials into AI-powered flashcards and quizzes.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#5A5FF0] text-white font-bold rounded-xl hover:bg-[#4A4FD0] transition-colors"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
