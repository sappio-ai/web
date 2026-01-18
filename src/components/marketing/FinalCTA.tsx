'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function FinalCTA() {
  const [waitlistModeEnabled, setWaitlistModeEnabled] = useState(true)
  const [checkingMode, setCheckingMode] = useState(true)

  useEffect(() => {
    const checkWaitlistMode = async () => {
      try {
        const response = await fetch('/api/waitlist/validate-code')
        const data = await response.json()
        setWaitlistModeEnabled(data.waitlistModeEnabled)
      } catch (error) {
        console.error('Error checking waitlist mode:', error)
      } finally {
        setCheckingMode(false)
      }
    }

    checkWaitlistMode()
  }, [])

  return (
    <div className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Paper Shadow Effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#1A1D2E] rounded-3xl translate-y-3 translate-x-3 transition-transform duration-300 group-hover:translate-y-4 group-hover:translate-x-4" />

          <div className="relative bg-white rounded-3xl border-2 border-[#1A1D2E] p-12 md:p-20 text-center overflow-hidden">
            {/* Decorative Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDE59] rounded-bl-[100px] opacity-20" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#5A5FF0] rounded-tr-[80px] opacity-10" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8FAFB] border border-[#E2E8F0] mb-8">
                <Sparkles className="w-4 h-4 text-[#5A5FF0]" />
                <span className="text-sm font-semibold text-[#1A1D2E]">
                  {checkingMode ? "Loading..." : waitlistModeEnabled ? "Limited Early Access" : "Get started in seconds"}
                </span>
              </div>

              <h2 className="text-[48px] md:text-[64px] font-bold text-[#1A1D2E] mb-6 tracking-[-0.03em] leading-[1.05] max-w-2xl mx-auto">
                Ready to ace <br className="hidden md:block" /> your exams?
              </h2>

              <p className="text-xl text-[#64748B] mb-12 max-w-lg mx-auto leading-relaxed">
                Stop stressing over messy notes. Convert them into clear, actionable study packs in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* Primary CTA with Paper Shadow */}
                <div className="relative w-full sm:w-auto group/btn">
                  <div className="absolute inset-0 bg-[#1A1D2E] rounded-xl translate-y-1.5 translate-x-1.5 transition-transform group-hover/btn:translate-y-2 group-hover/btn:translate-x-2" />
                  <Link
                    href={checkingMode || waitlistModeEnabled ? "/waitlist" : "/signup"}
                    className="relative flex items-center justify-center px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-lg font-bold rounded-xl border-2 border-[#1A1D2E] transition-colors shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      {checkingMode ? "Loading..." : waitlistModeEnabled ? "Join the waitlist" : "Start Learning for Free"}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Link>
                </div>

                {/* Secondary CTA */}
                <Link
                  href="/#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-[#F8FAFB] text-[#1A1D2E] text-lg font-bold rounded-xl border-2 border-[#E2E8F0] hover:border-[#CBD5E1] transition-all duration-200"
                >
                  See how it works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
