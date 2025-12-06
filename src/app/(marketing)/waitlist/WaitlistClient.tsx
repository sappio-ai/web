'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Copy, Share2, ChevronDown, Sparkles, Target, TrendingUp } from 'lucide-react'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import BookmarkCorner from '@/components/ui/BookmarkNotch'
import Highlight from '@/components/ui/InkHighlight'
import { useSearchParams } from 'next/navigation'

export default function WaitlistClient() {
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
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

  // Video lazy loading
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
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

  // Capture referral code from URL on mount
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferredBy(ref)
    }
  }, [searchParams])

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

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-32">
        <div className="max-w-2xl w-full">
          <div className="relative bg-white rounded-2xl p-12 border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <BookmarkCorner size="md" />
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h1 className="text-5xl font-bold text-[var(--ink)] mb-3 tracking-tight">You&apos;re in! 🎉</h1>
              <p className="text-lg text-[var(--text)]">We&apos;ll email you when early access opens.</p>
            </div>

            <div className="bg-[var(--bg)] rounded-xl p-6 border border-[var(--border)] mb-8">
              <h3 className="text-base font-bold text-[var(--ink)] mb-4">Share with friends</h3>
              <div className="flex gap-3">
                <button
                  onClick={copyReferralLink}
                  className="flex-1 px-4 py-3 bg-white hover:bg-[var(--bg)] text-[var(--ink)] text-sm font-semibold rounded-xl border border-[var(--border)] transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="px-4 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-sm font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {formData.wantsEarlyAccess && (
              <div className="bg-gradient-to-br from-[var(--accent)]/5 to-[var(--primary)]/5 rounded-xl p-6 border border-[var(--accent)]/20 mb-8">
                <h3 className="text-base font-bold text-[var(--ink)] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  Your founding member benefits
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">Early access invitation</p>
                      <p className="text-xs text-[var(--text)]">Get in before everyone else</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">12-month founding price lock</p>
                      <p className="text-xs text-[var(--text)]">Lock in today&apos;s prices for a full year</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">7-day Student Pro trial</p>
                      <p className="text-xs text-[var(--text)]">Full access to all premium features</p>
                    </div>
                  </li>
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-[var(--ink)] mb-4">What happens next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[var(--primary)]">1</span>
                  </div>
                  <p className="text-base text-[var(--text)]">You&apos;ll receive an invite email when early access opens</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[var(--primary)]">2</span>
                  </div>
                  <p className="text-base text-[var(--text)]">Sign up and your benefits will be applied automatically</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[var(--primary)]">3</span>
                  </div>
                  <p className="text-base text-[var(--text)]">Start creating study packs and ace your exams</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-32 relative overflow-visible">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Left: Pitch + Benefits */}
          <div className="relative z-10">
            <h1 className="text-[56px] font-bold text-[var(--ink)] mb-6 tracking-[-0.02em] leading-[1.05]">
              Join the <Highlight>waitlist</Highlight>
            </h1>
            <p className="text-lg text-[var(--text)] mb-10 leading-relaxed">
              Be among the first to transform how you study. Get early access to Sappio and start acing your exams.
            </p>
            
            {/* Benefits */}
            <div className="space-y-5 mb-10">
              {[
                { icon: Sparkles, title: 'Early access', desc: 'Get in before the public launch' },
                { icon: Target, title: 'Exclusive updates', desc: 'Stay in the loop as we build' },
                { icon: TrendingUp, title: 'Shape the product', desc: 'Your feedback matters' }
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--ink)] mb-1">{benefit.title}</p>
                    <p className="text-sm text-[var(--text)]">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* What you get mini list */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)]" style={{ boxShadow: 'var(--shadow)' }}>
              <h3 className="text-sm font-bold text-[var(--ink)] mb-4">What you get:</h3>
              <div className="grid grid-cols-2 gap-3">
                {['AI-generated flashcards', 'Practice quizzes', 'Smart summaries', 'Mind maps', 'Spaced repetition', 'Progress tracking'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                    <span className="text-xs text-[var(--text)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Video + Form */}
          <div className="relative z-10 space-y-8">
            {/* Video with browser frame */}
            <div className="relative">
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-500 border border-gray-200">
                    sappio.ai
                  </div>
                </div>
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                >
                  <source src="/hero2.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <BookmarkCorner size="md" />
            
            <div 
              className="bg-white rounded-2xl p-8 border border-[var(--border)]"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[var(--ink)] mb-2">
                    Email <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl text-base text-[var(--ink)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Optional questions accordion */}
                <details className="border border-[var(--border)] rounded-xl overflow-hidden group">
                  <summary className="w-full px-4 py-3 bg-[var(--bg)] hover:bg-white cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-[var(--ink)] transition-colors">
                    <span>Optional questions</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  
                  <div className="p-4 space-y-4 bg-white border-t border-[var(--border)]">
                    <div>
                      <label htmlFor="studying" className="block text-sm font-semibold text-[var(--ink)] mb-2">
                        What are you studying?
                      </label>
                      <select
                        id="studying"
                        value={formData.studying}
                        onChange={(e) => setFormData({ ...formData, studying: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Law">Law</option>
                        <option value="Languages">Languages</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="currentTool" className="block text-sm font-semibold text-[var(--ink)] mb-2">
                        How do you study today?
                      </label>
                      <select
                        id="currentTool"
                        value={formData.currentTool}
                        onChange={(e) => setFormData({ ...formData, currentTool: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="Anki">Anki</option>
                        <option value="Quizlet">Quizlet</option>
                        <option value="Notes">Notes</option>
                        <option value="PDFs">PDFs</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded-xl">
                      <input
                        type="checkbox"
                        id="wantsEarlyAccess"
                        checked={formData.wantsEarlyAccess}
                        onChange={(e) => setFormData({ ...formData, wantsEarlyAccess: e.target.checked })}
                        className="mt-1 w-4 h-4 text-[var(--primary)] bg-white border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--primary)]/20"
                      />
                      <label htmlFor="wantsEarlyAccess" className="text-sm text-[var(--ink)] cursor-pointer">
                        <span className="font-semibold">I want early access benefits</span>
                        <span className="block text-xs text-[var(--text)] mt-1">
                          Get founding member perks: 12-month price lock, 7-day Pro trial, and priority access
                        </span>
                      </label>
                    </div>
                  </div>
                </details>

                {error && (
                  <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl">
                    <p className="text-sm text-[#DC2626]">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-all duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2 active:scale-[0.98] relative overflow-hidden group"
                >
                  <span className="relative z-10">{isSubmitting ? 'Joining...' : 'Join waitlist'}</span>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <p className="text-xs text-center text-[var(--text)] leading-relaxed">
                  No spam. One email when you&apos;re in. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
