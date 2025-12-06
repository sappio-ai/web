'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Copy, Share2, ChevronDown, Sparkles, Target, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function WaitlistClient() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    studying: '',
    currentTool: '',
    wantsEarlyAccess: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [referredBy, setReferredBy] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Capture referral code and email from URL on mount
  useEffect(() => {
    const ref = searchParams.get('ref')
    const email = searchParams.get('email')

    if (ref) {
      setReferredBy(ref)
    }
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    }
  }, [searchParams])

  // Video lazy loading
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          studying: formData.studying,
          currentTool: formData.currentTool,
          wantsEarlyAccess: formData.wantsEarlyAccess,
          referredBy: referredBy
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setReferralCode(data.referralCode)
      setSuccess(true)

      AnalyticsService.trackWaitlistJoined(formData.email, formData.studying)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/waitlist?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent("I just joined the Sappio waitlist! Turn your notes into study packs with AI. Join me:")
    const url = encodeURIComponent(`${window.location.origin}/waitlist?ref=${referralCode}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  // --- Success View (The "Ticket") ---
  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] relative flex items-center justify-center p-4">
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
        }} />

        <div className="relative w-full max-w-lg">
          {/* Paper Shadow Effect */}
          <div className="absolute inset-0 bg-[#1A1D2E] rounded-3xl translate-y-3 translate-x-3" />
          
          <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-[#1A1D2E]">
            {/* Header with gradient accent */}
            <div className="bg-gradient-to-br from-[#5A5FF0] to-[#4A4FD0] p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-xl">
                  <Check className="w-10 h-10 text-[#5A5FF0]" strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-2 tracking-[-0.02em]">You&apos;re on the list!</h2>
                <p className="text-white/80 text-lg">We&apos;ve reserved your spot.</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="bg-[#F8FAFB] rounded-xl p-5 border-2 border-[#E2E8F0] mb-8">
                <p className="text-xs font-bold text-[#64748B] mb-3 uppercase tracking-wider">Share & Skip the Line</p>
                <div className="flex gap-2 mb-3">
                  <code className="flex-1 bg-white border border-[#E2E8F0] px-3 py-2.5 rounded-lg text-[#1A1D2E] font-mono text-sm truncate">
                    {`${window.location.origin}/waitlist?ref=${referralCode}`}
                  </code>
                  <button
                    onClick={copyReferralLink}
                    className="p-2.5 bg-white border-2 border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFB] text-[#64748B] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={shareOnTwitter}
                  className="w-full py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share on Twitter
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#1A1D2E]">Next Steps</h3>
                {[
                  'Check your email for confirmation',
                  'Wait for your exclusive invite code',
                  'Get instant access to Student Pro features'
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#5A5FF0]">{i + 1}</span>
                    </div>
                    <span className="text-[15px] text-[#64748B] font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Main View ---
  return (
    <div className="min-h-screen bg-[#F8FAFB] relative overflow-hidden">
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left Column: Copy & Benefits */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5A5FF0]/10 border border-[#5A5FF0]/20 text-[#5A5FF0] text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Early Access Open • Invites sent weekly</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1A1D2E] mb-6 tracking-[-0.02em] leading-[1.1]">
                Stop just taking notes. <br />
                <span className="text-[#5A5FF0]">Start understanding.</span>
              </h1>
              <p className="text-xl text-[#64748B] leading-relaxed max-w-lg mb-8">
                Get early access to the AI study companion that turns your messy lecture slides into perfect study packs in seconds.
              </p>

              {/* Video Showcase */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-[#E2E8F0] bg-white aspect-video group">
                <div className="absolute inset-0 bg-[#1A1D2E]/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
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

                {/* Floating Caption Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10 shadow-lg whitespace-nowrap z-20 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-white tracking-wide">
                    PDF → Flashcards + Quiz + Mind map in ~60s
                  </span>
                </div>
              </div>
            </div>

            {/* Founding Member Card */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

              <h3 className="text-lg font-bold text-[#1A1D2E] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
                Founding Member Perks
              </h3>

              <div className="space-y-4">
                {[
                  { title: '12-Month Price Lock', desc: 'Secure the lowest price forever' },
                  { title: 'Priority Access', desc: 'Skip the line when we launch' },
                  { title: '7-Day Pro Trial', desc: 'Full access to all AI features' }
                ].map((perk, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#F59E0B]" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1D2E]">{perk.title}</p>
                      <p className="text-xs text-[#64748B]">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Social Proof */}
            <p className="text-sm text-[#94A3B8] font-medium">
              Join 250+ students on the waitlist
            </p>
          </div>

          {/* Right Column: The Form Stack */}
          <div className="relative lg:mt-12">
            {/* Paper Shadow Effect */}
            <div className="absolute inset-0 bg-[#1A1D2E] rounded-3xl translate-y-3 translate-x-3" />

            {/* Main Form Card */}
            <div className="relative bg-white rounded-3xl p-8 md:p-10 border-2 border-[#1A1D2E] overflow-hidden">

              {/* Decorative Corner Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFDE59] rounded-bl-[60px] opacity-20" />
              
              {/* Bookmark Tab */}
              <div className="absolute -top-0 right-12 w-[32px] h-[26px] bg-[#5A5FF0] rounded-b-[6px] shadow-sm z-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[22px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-[#1A1D2E]">Secure your spot</h3>

                  {/* Mini Perks List */}
                  <div className="space-y-2">
                    {[
                      '12-month price lock',
                      'Priority access',
                      '7-day Pro trial'
                    ].map((perk, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2.5} />
                        <span className="text-sm text-[#475569] font-medium">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#1A1D2E] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-[#1A1D2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/20 focus:border-[#5A5FF0] transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <details className="group">
                    <summary className="list-none flex items-center gap-2 text-sm font-medium text-[#5A5FF0] cursor-pointer hover:text-[#4A4FD0] transition-colors mb-2">
                      <span>Tell us more (Optional)</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Field of Study</label>
                          <select
                            value={formData.studying}
                            onChange={(e) => setFormData({ ...formData, studying: e.target.value })}
                            className="w-full px-3 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-lg text-sm text-[#1A1D2E] focus:outline-none focus:border-[#5A5FF0]"
                          >
                            <option value="">Select...</option>
                            <option value="CS">Computer Science</option>
                            <option value="Med">Medicine</option>
                            <option value="Law">Law</option>
                            <option value="Eng">Engineering</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Current Method</label>
                          <select
                            value={formData.currentTool}
                            onChange={(e) => setFormData({ ...formData, currentTool: e.target.value })}
                            className="w-full px-3 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-lg text-sm text-[#1A1D2E] focus:outline-none focus:border-[#5A5FF0]"
                          >
                            <option value="">Select...</option>
                            <option value="Anki">Anki</option>
                            <option value="Quizlet">Quizlet</option>
                            <option value="Notes">Notes</option>
                            <option value="Paper">Paper</option>
                          </select>
                        </div>
                      </div>

                      <label className="flex items-start gap-3 p-3 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1] transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.wantsEarlyAccess}
                          onChange={(e) => setFormData({ ...formData, wantsEarlyAccess: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-[#5A5FF0] border-gray-300 rounded focus:ring-[#5A5FF0]"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-[#1A1D2E] block">I want founding member benefits</span>
                          <span className="text-[#64748B]">Includes 12-month price lock & Pro trial</span>
                        </div>
                      </label>
                    </div>
                  </details>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}

                {/* Button with Paper Shadow */}
                <div className="relative group/btn">
                  <div className="absolute inset-0 bg-[#1A1D2E] rounded-xl translate-y-1.5 translate-x-1.5 transition-transform group-hover/btn:translate-y-2 group-hover/btn:translate-x-2" />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full px-6 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] disabled:opacity-70 disabled:cursor-not-allowed text-white text-[16px] font-semibold rounded-xl border-2 border-[#1A1D2E] transition-colors flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Join Waitlist
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-center text-[#94A3B8]">
                  No spam, one email when you’re in.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
