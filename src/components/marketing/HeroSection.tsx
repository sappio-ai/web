'use client'

import { Shield, Lock, Target, Check, Sparkles, FileText, BrainCircuit, GraduationCap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DotPattern from '@/components/ui/DotPattern'
import Highlight from '@/components/ui/InkHighlight'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      router.push(`/waitlist?email=${encodeURIComponent(email)}`)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => { })
          } else {
            video.pause()
            video.currentTime = 0
          }
        })
      },
      { threshold: 0.25 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-[#F8FAFB]">
        <DotPattern className="opacity-[0.15] fill-[var(--ink)]" width={32} height={32} />
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F8FAFB_100%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16 lg:mb-24 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-[#5A5FF0]" />
            <span className="text-sm font-semibold text-[#1A1D2E]">Early Access: Invites sent weekly</span>
          </div>

          {/* Headline */}
          <h1 className="text-[56px] md:text-[80px] leading-[1.05] font-bold text-[#1A1D2E] tracking-[-0.03em] mb-8 max-w-5xl">
            Turn your messy notes into <br className="hidden md:block" />
            <span className="relative inline-block">
              <span className="relative z-10">perfect study packs.</span>
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-[#FFDE59] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.8" />
              </svg>
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-2xl text-[#64748B] max-w-2xl mb-10 leading-relaxed">
            Upload any PDF or slide deck. We&apos;ll generate exam-ready <span className="text-[#1A1D2E] font-semibold">flashcards</span>, <span className="text-[#1A1D2E] font-semibold">quizzes</span>, and <span className="text-[#1A1D2E] font-semibold">mind maps</span> in seconds.
          </p>

          {/* Input Form wrapped in 'Paper' aesthetic */}
          <div className="w-full max-w-md relative group">
            <div className="absolute inset-0 bg-[#1A1D2E] rounded-2xl translate-y-2 translate-x-2 transition-transform group-hover:translate-y-3 group-hover:translate-x-3" />
            <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border-2 border-[#1A1D2E]">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-transparent text-lg text-[#1A1D2E] placeholder:text-[#94A3B8] outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold text-lg rounded-xl transition-colors shadow-sm whitespace-nowrap">
                Join waitlist
              </button>
            </form>
          </div>
          <p className="mt-4 text-sm text-[#64748B] font-medium">
            No spam. One email when you&apos;re in.
          </p>
        </div>

        {/* The 'Digital Desk' Visual */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Floating Elements (Decor) */}
          <div className="absolute -top-12 -left-12 lg:-left-24 w-48 h-48 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-4 transform -rotate-6 z-0 hidden lg:block animate-float-slow">
            <div className="flex items-center gap-3 mb-3 border-b border-[#F1F5F9] pb-2">
              <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#5A5FF0]" />
              </div>
              <div className="h-2 w-20 bg-[#F1F5F9] rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-[#F1F5F9] rounded-full" />
              <div className="h-2 w-3/4 bg-[#F1F5F9] rounded-full" />
              <div className="h-2 w-5/6 bg-[#F1F5F9] rounded-full" />
            </div>
          </div>

          <div className="absolute -top-8 -right-12 lg:-right-16 w-40 h-auto bg-white rounded-xl border border-[#E2E8F0] shadow-xl p-4 transform rotate-3 z-0 hidden lg:block animate-float-delayed">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#10B981]">98% Match</span>
              <BrainCircuit className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <div className="h-16 bg-[#F8FAFB] rounded-lg border border-[#F1F5F9] flex items-center justify-center">
              <span className="text-[10px] text-[#94A3B8] font-mono">Keep going! 🔥</span>
            </div>
          </div>

          {/* Main Video 'Tablet' */}
          <div className="relative bg-[#1A1D2E] rounded-[24px] p-2 md:p-3 shadow-2xl transform transition-transform hover:scale-[1.005] duration-500 z-10">
            <div className="bg-white rounded-[20px] overflow-hidden relative">
              {/* Browser UI */}
              <div className="bg-white border-b border-[#F1F5F9] px-6 py-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                </div>
                <div className="px-4 py-1.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#64748B] flex items-center gap-2">
                  <Lock className="w-3 h-3" /> sappio.ai
                </div>
                <div className="w-16" /> {/* spacer */}
              </div>

              {/* Video Area */}
              <div className="relative aspect-[16/9] bg-[#F8FAFB]">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/hero2.mp4" type="video/mp4" />
                </video>

                {/* Overlay Caption */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#1A1D2E]/90 backdrop-blur-md rounded-full shadow-lg whitespace-nowrap z-20 flex items-center gap-3 border border-white/10">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide">
                    PDF → Flashcards + Quiz + Mind map in ~60s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Perks/Trust Bar (Integrated at bottom of hero) */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 lg:gap-12 opacity-80">
          {[
            { label: 'Built for University', icon: GraduationCap },
            { label: 'Trusted by 250+ Students', icon: Check },
            { label: 'Cancel anytime', icon: Shield },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-full shadow-sm">
              <item.icon className="w-4 h-4 text-[#5A5FF0]" />
              <span className="text-sm font-semibold text-[#1A1D2E]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
