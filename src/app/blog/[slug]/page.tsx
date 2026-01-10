import { blogPosts } from '@/lib/blog-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Sparkles } from 'lucide-react'
import { Metadata } from 'next'
import DotPattern from '@/components/ui/DotPattern'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = blogPosts.find((p) => p.slug === slug)

    if (!post) {
        return { title: 'Not Found' }
    }

    return {
        title: `${post.title} | Sappio Blog`,
        description: post.excerpt,
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    const post = blogPosts.find((p) => p.slug === slug)

    if (!post) {
        notFound()
    }

    const currentIndex = blogPosts.findIndex((p) => p.slug === slug)
    const nextPost = blogPosts[currentIndex + 1] || blogPosts[0]
    const prevPost = blogPosts[currentIndex - 1] || blogPosts[blogPosts.length - 1]

    return (
        <article className="min-h-screen bg-[#F8FAFB] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-10 bg-[#F8FAFB]">
                <DotPattern className="opacity-[0.15] fill-[#1A1D2E]" width={32} height={32} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F8FAFB_100%)]" />
            </div>

            {/* Header */}
            <header className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[#1A1D2E] hover:text-[#5A5FF0] transition-colors mb-8 text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="px-3 py-1 text-sm font-bold bg-white text-[#5A5FF0] rounded-full border border-[#E2E8F0]">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-[#1A1D2E] font-medium">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                    </div>

                    <h1 className="text-[32px] md:text-[44px] leading-[1.15] font-bold text-[#1A1D2E] tracking-[-0.02em] mb-6">
                        {post.title}
                    </h1>

                    <p className="text-xl text-[#1A1D2E] leading-relaxed font-medium">
                        {post.excerpt}
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#1A1D2E] rounded-2xl translate-y-2 translate-x-2" />
                        <div
                            className="relative bg-white rounded-2xl border-2 border-[#1A1D2E] p-8 md:p-12
                text-[#1A1D2E]
                prose prose-lg max-w-none
                
                {/* Headings */}
                prose-headings:text-[#1A1D2E] prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-[32px] prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b-2 prose-h2:border-[#F1F5F9] prose-h2:pb-4
                prose-h3:text-[24px] prose-h3:mt-12 prose-h3:mb-4
                prose-h4:text-[20px] prose-h4:mt-8 prose-h4:mb-3
                
                {/* Paragraphs */}
                prose-p:text-[#1A1D2E] prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-[1.125rem]
                
                {/* Highlights & Accents */}
                prose-strong:text-[#5A5FF0] prose-strong:font-bold
                prose-a:text-[#5A5FF0] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                
                {/* Lists */}
                prose-ul:my-8 prose-ul:list-none prose-ul:pl-0 prose-ul:space-y-3
                prose-ol:my-8 prose-ol:pl-6 prose-ol:space-y-3
                
                {/* List Items (Custom Bullet) */}
                [&_ul>li]:relative [&_ul>li]:pl-10
                [&_ul>li:before]:content-['->'] [&_ul>li:before]:absolute [&_ul>li:before]:left-2 [&_ul>li:before]:text-[#5A5FF0] [&_ul>li:before]:font-bold
                
                {/* Blockquotes */}
                prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-[#1A1D2E]
                prose-blockquote:bg-[#F8FAFB] prose-blockquote:p-8 prose-blockquote:rounded-2xl prose-blockquote:border-none prose-blockquote:shadow-sm prose-blockquote:my-10
                prose-blockquote:relative prose-blockquote:overflow-hidden
                [&_blockquote:before]:content-['“'] [&_blockquote:before]:absolute [&_blockquote:before]:top-[-20px] [&_blockquote:before]:left-[20px] [&_blockquote:before]:text-[100px] [&_blockquote:before]:text-[#5A5FF0]/10 [&_blockquote:before]:font-serif
                
                {/* First Paragraph Drop Cap */}
                [&>p:first-of-type::first-letter]:text-5xl [&>p:first-of-type::first-letter]:font-bold [&>p:first-of-type::first-letter]:text-[#5A5FF0] [&>p:first-of-type::first-letter]:mr-3 [&>p:first-of-type::first-letter]:float-left [&>p:first-of-type::first-letter]:leading-[1]
                
                {/* Reset & Base overrides */}
                [&_*]:text-[#1A1D2E]
                [&_a]:text-[#5A5FF0]
                [&_strong]:text-[#5A5FF0]"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </div>
            </div>

            {/* CTA */}
            <section className="px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#5A5FF0] rounded-2xl p-8 md:p-12 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6">
                            <Sparkles className="w-4 h-4" />
                            Try Sappio Today
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Put These Ideas Into Practice
                        </h3>
                        <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                            Turn your study materials into AI-powered flashcards and quizzes in seconds.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#5A5FF0] font-bold rounded-xl hover:bg-[#F8FAFB] transition-colors"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Navigation */}
            <section className="px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prevPost && prevPost.slug !== post.slug && (
                            <Link
                                href={`/blog/${prevPost.slug}`}
                                className="group p-6 bg-white rounded-xl border-2 border-[#E2E8F0] hover:border-[#5A5FF0] transition-colors"
                            >
                                <span className="text-sm text-[#1A1D2E] font-medium mb-2 block">← Previous</span>
                                <span className="text-[#1A1D2E] font-bold group-hover:text-[#5A5FF0] transition-colors line-clamp-2">
                                    {prevPost.title}
                                </span>
                            </Link>
                        )}
                        {nextPost && nextPost.slug !== post.slug && (
                            <Link
                                href={`/blog/${nextPost.slug}`}
                                className="group p-6 bg-white rounded-xl border-2 border-[#E2E8F0] hover:border-[#5A5FF0] transition-colors md:text-right"
                            >
                                <span className="text-sm text-[#1A1D2E] font-medium mb-2 block">Next →</span>
                                <span className="text-[#1A1D2E] font-bold group-hover:text-[#5A5FF0] transition-colors line-clamp-2">
                                    {nextPost.title}
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </article>
    )
}
