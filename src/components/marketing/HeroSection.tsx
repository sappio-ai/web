import Link from 'next/link'
import { Shield, Lock, Target, Award } from 'lucide-react'
import HeroPreviewCard from '@/components/ui/HeroPreviewCard'
import DecorArt from '@/components/ui/DecorArt'

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-visible">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="relative z-20">
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
            
            {/* Trust row */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Lock, text: 'Privacy-first' },
                { icon: Shield, text: 'Encrypted' },
                { icon: Target, text: 'Study faster' }
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

          {/* Right: Hero mascot image at 100% opacity */}
          <div className="relative flex items-center justify-center">
            <DecorArt 
              src="/brand/mascot/mascot-hero-3x2.png"
              alt="Sappio mascot with study materials"
              variant="float"
              width={600}
              height={400}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
