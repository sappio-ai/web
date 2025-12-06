import { Suspense } from 'react'
import { Metadata } from 'next'
import WaitlistClient from '@/app/(marketing)/waitlist/WaitlistClient'
import WaitlistMiniFAQ from '@/components/marketing/WaitlistMiniFAQ'

export const metadata: Metadata = {
  title: "Join the Waitlist",
  description: "Get early access to Sappio. Join 250+ students on the waitlist and secure founding member benefits including 12-month price lock and priority access.",
  openGraph: {
    title: "Join the Sappio Waitlist - Early Access",
    description: "Get early access to Sappio. Join 250+ students on the waitlist and secure founding member benefits.",
    url: "https://sappio.ai/waitlist",
  },
  twitter: {
    title: "Join the Sappio Waitlist - Early Access",
    description: "Get early access to Sappio. Join 250+ students on the waitlist and secure founding member benefits.",
  }
}

export default function WaitlistPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
        <WaitlistClient />
      </Suspense>
      <WaitlistMiniFAQ />
    </>
  )
}
