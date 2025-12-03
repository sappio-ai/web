'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import BookmarkCorner from '@/components/ui/BookmarkNotch'
import Link from 'next/link'

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  
  const tiers = [
    { 
      name: 'Free', 
      desc: 'Get started', 
      features: ['5 study packs/month', '20 cards per pack', 'Basic quizzes', 'Progress tracking'],
      bestFor: 'Casual',
      highlight: false
    },
    { 
      name: 'Student', 
      desc: 'Most popular', 
      features: ['Unlimited study packs', '100 cards per pack', 'Advanced quizzes', 'Mind maps', 'Priority support'],
      bestFor: 'Exam season',
      highlight: true
    },
    { 
      name: 'Pro', 
      desc: 'For power users', 
      features: ['Everything in Student', 'Unlimited cards', 'API access', 'Custom integrations'],
      bestFor: 'Power user',
      highlight: false
    }
  ]
  
  return (
    <div>
      {/* Monthly/Yearly toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm font-semibold ${!isYearly ? 'text-[var(--ink)]' : 'text-[var(--text)]'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative w-14 h-7 bg-[var(--bg)] border-2 border-[var(--border)] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
        >
          <div 
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-[var(--primary)] rounded-full transition-transform ${
              isYearly ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-sm font-semibold ${isYearly ? 'text-[var(--ink)]' : 'text-[var(--text)]'}`}>
          Yearly
        </span>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {tiers.map((tier, i) => (
          <div 
            key={i} 
            className={`relative rounded-2xl p-8 transition-all duration-200 ${
              tier.highlight 
                ? 'border-2 border-[var(--primary)] hover:-translate-y-1' 
                : 'border border-[var(--border)] hover:border-[var(--primary)] hover:-translate-y-0.5'
            }`}
            style={{ 
              backgroundColor: 'white',
              boxShadow: tier.highlight ? '0 0 0 4px rgba(91, 108, 255, 0.08), var(--shadow-lg)' : 'var(--shadow)'
            }}
          >
            {tier.highlight && <BookmarkCorner size="md" />}
            
            <h3 className="text-2xl font-bold text-[var(--ink)] mb-1 mt-2">{tier.name}</h3>
            <p className="text-sm text-[var(--text)] mb-8">{tier.desc}</p>
            <ul className="space-y-3 mb-8">
              {tier.features.map((f, j) => (
                <li key={j} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--primary)]" />
                  <span className="text-sm text-[var(--text)]">{f}</span>
                </li>
              ))}
            </ul>
            
            <div className="space-y-3">
              <Link
                href="/waitlist"
                className="block w-full px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl transition-all text-center"
              >
                Join waitlist
              </Link>
              <button className="w-full px-6 py-3 bg-white hover:bg-[var(--bg)] text-[var(--text)] text-sm font-semibold rounded-xl border border-[var(--border)] transition-all">
                Notify me
              </button>
            </div>
            
            <p className="text-xs text-[var(--text)] text-center mt-4">
              Best for: <span className="font-semibold">{tier.bestFor}</span>
            </p>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-center text-[var(--primary)] font-semibold">
        💰 Early access pricing will be discounted for waitlist members
      </p>
    </div>
  )
}
