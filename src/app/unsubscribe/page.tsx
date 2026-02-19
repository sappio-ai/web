'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    fetch('/api/email/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => {
        setStatus(res.ok ? 'success' : 'error')
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E2E8F0] max-w-md w-full text-center">
      {status === 'loading' && (
        <>
          <div className="w-12 h-12 rounded-full bg-[#F1F5F9] animate-pulse mx-auto mb-4" />
          <p className="text-[#64748B] text-[15px]">Processing your request...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-4xl mb-4">&#10003;</div>
          <h1 className="text-[22px] font-bold text-[#1A1D2E] mb-2">Unsubscribed</h1>
          <p className="text-[15px] text-[#64748B] mb-6">
            You&apos;ve been unsubscribed from email reminders. You can re-enable them anytime in your account settings.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[15px] font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
          </a>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-[22px] font-bold text-[#1A1D2E] mb-2">Something went wrong</h1>
          <p className="text-[15px] text-[#64748B]">
            We couldn&apos;t process your unsubscribe request. Please try again or manage your preferences in your account settings.
          </p>
        </>
      )}

      {status === 'no-token' && (
        <>
          <h1 className="text-[22px] font-bold text-[#1A1D2E] mb-2">Invalid Link</h1>
          <p className="text-[15px] text-[#64748B]">
            This unsubscribe link appears to be invalid. Please use the link from your email.
          </p>
        </>
      )}
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E2E8F0] max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-[#F1F5F9] animate-pulse mx-auto mb-4" />
          <p className="text-[#64748B] text-[15px]">Processing your request...</p>
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </div>
  )
}
