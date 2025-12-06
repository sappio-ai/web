import { Metadata } from 'next'
import HeroSection from '@/components/marketing/HeroSection'
import StepTimeline from '@/components/marketing/StepTimeline'
import SeeTheOutput from '@/components/marketing/SeeTheOutput'
import WhatYouGet from '@/components/marketing/WhatYouGet'
import PricingSection from '@/components/marketing/PricingSection'
import FAQAccordion from '@/components/marketing/FAQAccordion'
import FinalCTA from '@/components/marketing/FinalCTA'

export const metadata: Metadata = {
  title: "Sappio - Turn Your Notes Into Perfect Study Packs",
  description: "Upload any PDF or slide deck. We'll generate exam-ready flashcards, quizzes, and mind maps in seconds. AI-powered study companion for university students.",
  openGraph: {
    title: "Sappio - Turn Your Notes Into Perfect Study Packs",
    description: "Upload any PDF or slide deck. We'll generate exam-ready flashcards, quizzes, and mind maps in seconds.",
    url: "https://sappio.ai",
  },
  twitter: {
    title: "Sappio - Turn Your Notes Into Perfect Study Packs",
    description: "Upload any PDF or slide deck. We'll generate exam-ready flashcards, quizzes, and mind maps in seconds.",
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] relative selection:bg-[var(--primary)] selection:text-white overflow-hidden">

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works - Process Steps */}
      <StepTimeline />

      {/* See the Output - Big demo section */}
      <SeeTheOutput />

      {/* All Features - Bento Grid */}
      <WhatYouGet />

      {/* Pricing */}
      <PricingSection />

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
        <div className="max-w-5xl mx-auto">
          <FinalCTA />
        </div>
      </section>
    </div>
  )
}
