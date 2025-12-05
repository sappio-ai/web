import { Suspense } from 'react'
import WaitlistClient from '@/app/(marketing)/waitlist/WaitlistClient'
import WaitlistMiniFAQ from '@/components/marketing/WaitlistMiniFAQ'

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
