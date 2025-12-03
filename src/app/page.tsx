import HeroSection from '@/components/marketing/HeroSection'
import StepTimeline from '@/components/marketing/StepTimeline'
import SeeTheOutput from '@/components/marketing/SeeTheOutput'
import WhatYouGet from '@/components/marketing/WhatYouGet'
import PricingSection from '@/components/marketing/PricingSection'
import FAQAccordion from '@/components/marketing/FAQAccordion'
import FinalCTA from '@/components/marketing/FinalCTA'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-bold text-[var(--ink)] mb-4 tracking-[-0.01em]">
              How it works
            </h2>
            <p className="text-lg text-[var(--text)]">Three simple steps to better studying</p>
          </div>
          
          <StepTimeline />
        </div>
      </section>

      {/* See the Output - Big demo section */}
      <SeeTheOutput />

      {/* What You Get - Compact 4 cards */}
      <WhatYouGet />

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-bold text-[var(--ink)] mb-4 tracking-[-0.01em]">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[var(--text)]">Choose the plan that works for you</p>
          </div>
          
          <PricingSection />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-bold text-[var(--ink)] mb-4 tracking-[-0.01em]">
              Frequently asked questions
            </h2>
          </div>
          
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <FinalCTA />
        </div>
      </section>
    </div>
  )
}
