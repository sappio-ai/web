'use client'

import { Check, X, Sparkles, Zap, GraduationCap, Crown } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function PricingSection() {
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

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      desc: 'For casual learning',
      features: [
        '5 packs / month',
        '40 cards per pack',
        'Basic quizzes',
        'No exports'
      ],
      cta: checkingMode ? 'Loading...' : waitlistModeEnabled ? 'Start for free' : 'Start Learning',
      href: checkingMode || waitlistModeEnabled ? '/waitlist' : '/signup',
      popular: false,
      color: 'bg-white',
      border: 'border-slate-200',
      text: 'text-slate-900',
      button: 'bg-slate-100 text-slate-900 hover:bg-slate-200'
    },
    {
      name: 'Student Pro',
      price: '$9',
      period: '/mo',
      desc: 'For serious students',
      features: [
        '60 packs / month',
        'Unlimited cards',
        'Advanced quizzes',
        'Spaced repetition',
        'All export formats',
        'Priority support'
      ],
      cta: checkingMode ? 'Loading...' : waitlistModeEnabled ? 'Join Waitlist' : 'Get Started',
      href: checkingMode || waitlistModeEnabled ? '/waitlist' : '/signup',
      popular: true,
      color: 'bg-[#1A1D2E]',  // Dark Mode
      border: 'border-[#1A1D2E]',
      text: 'text-white',
      button: 'bg-[#5A5FF0] text-white hover:bg-[#4A4FD0]'
    },
    {
      name: 'Pro Plus',
      price: '$19',
      period: '/mo',
      desc: 'For heavy research',
      features: [
        '300 packs / month',
        'Everything in Student Pro',
        'API Access',
        'Deep research mode',
        'Team attributes'
      ],
      cta: checkingMode ? 'Loading...' : waitlistModeEnabled ? 'Join Waitlist' : 'Get Started',
      href: checkingMode || waitlistModeEnabled ? '/waitlist' : '/signup',
      popular: false,
      color: 'bg-white',
      border: 'border-slate-200',
      text: 'text-slate-900',
      button: 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900'
    }
  ]

  return (
    <div id="pricing" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="text-[40px] md:text-[56px] font-bold text-[#1A1D2E] mb-6 tracking-[-0.02em]">
          Choose later, free to start
        </h2>
        <p className="text-xl text-[#64748B]">
          Start free, upgrade when you need more packs and faster generation.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={`
                relative p-8 rounded-[32px] transition-all duration-300 flex flex-col h-full
                ${tier.popular ? 'scale-105 shadow-2xl z-10' : 'scale-100 shadow-xl z-0'}
                ${tier.color} ${tier.popular ? 'border-none' : `border ${tier.border}`}
            `}
          >
            {tier.popular && (
              <div className="absolute -top-5 left-0 right-0 flex justify-center">
                <div className="bg-gradient-to-r from-[#5A5FF0] to-[#6366f1] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 ring-4 ring-white">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.popular ? 'bg-white/10' : 'bg-slate-100'}`}>
                  {tier.name === 'Free' && <Zap className={`w-5 h-5 ${tier.popular ? 'text-white' : 'text-slate-600'}`} />}
                  {tier.popular && <GraduationCap className="w-5 h-5 text-white" />}
                  {(tier.name === 'Pro Plus' || tier.name === 'Power') && <Crown className="w-5 h-5 text-slate-600" />}
                </div>
                <h3 className={`text-xl font-bold ${tier.text}`}>{tier.name}</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-5xl font-bold tracking-tight ${tier.text}`}>
                  {tier.price}
                </span>
                {tier.period && (
                  <span className={`text-lg font-medium opacity-60 ${tier.text}`}>
                    {tier.period}
                  </span>
                )}
              </div>
              <p className={`font-medium opacity-80 ${tier.text}`}>{tier.desc}</p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {tier.features.map((feat, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${tier.popular ? 'bg-[#5A5FF0] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className={`text-[15px] font-medium opacity-90 ${tier.text}`}>
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={tier.href}
              className={`w-full py-4 rounded-2xl font-bold text-[16px] text-center transition-all duration-200 shadow-sm hover:shadow-md ${tier.button}`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 font-semibold text-sm shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {checkingMode ? "Loading..." : waitlistModeEnabled ? "Early access pricing is discounted for waitlist members" : "Introductory pricing available for a limited time"}
        </p>
      </div>
    </div>
  )
}
