import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock, Target, Award } from 'lucide-react'
import HeroPreviewCard from '@/components/ui/HeroPreviewCard'

export default function MarketingHero() {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 paper-texture ink-doodles overflow-hidden">
      {/* Background mascot illustration */}
      <div className="absolute right-0 top-20 w-1/2 h-96 opacity-[0.08] pointer-events-none hidden lg:block z-0">
        <Image
          src="/brand/mascot/mascot-hero-3x2.png"
          alt="Sappio mascot"
          fill
          className="object-contain object-right"
          priority
        />
      </div>
      
      {/* Orbit SVG behind card */}
      <svg 
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none opacity-10 hidden lg:block z-0" 
        viewBox="0 0 400 400"
      >
        <ellipse cx="200" cy="200" rx="180" ry="120" stroke="var(--primary)" strokeWidth="2" fill="none" strokeDasharray="10 6" />
        <circle cx="200" cy="80" r="4" fill="var(--primary)" />
        <circle cx="380" cy="200" r="4" fill="var(--primary)" />
        <circle cx="200" cy="320" r="4" fill="var(--primary)" />
        <circle cx="20" cy="200" r="4" fill="var(--primary)" />
      </svg>
      
      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <h1 className="text-[56px] md:text-[64px] leading-[1.05] font-bold text-[var(--ink)] mb-6 tracking-[-0.02em]">
              Turn your notes into study packs in minutes.
            </h1>
            <p className="text-lg text-[var(--text)] mb-8 leading-relaxed max-w-xl">
              Upload PDFs, docs, or links. Sappio generates flashcards, quizzes, summaries, and mind maps, then keeps you on track with spaced repetition.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/waitlist"
                className="px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-base font-semibold rounded-xl transition-all duration-150 text-center shadow-md hover:shadow-lg active:scale-[0.98] relative overflow-hidden group"
              >
                <span className="relative z-10">Join the waitlist</span>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white hover:bg-[var(--bg)] text-[var(--ink)] text-base font-semibold rounded-xl border-2 border-[var(--border)] transition-all duration-150 text-center hover:border-[var(--primary)]"
              >
                See how it works
              </a>
            </div>
            
            {/* Proof row */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Lock, text: 'Privacy-first' },
                { icon: Shield, text: 'Encrypted' },
                { icon: Target, text: 'Student-focused' },
                { icon: Award, text: 'Built for exams' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border)] rounded-full text-xs font-medium text-[var(--text)]"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Study Pack Pipeline card */}
          <div className="relative z-10">
            <HeroPreviewCard />
          </div>
        </div>
      </div>
    </section>
  )
}
