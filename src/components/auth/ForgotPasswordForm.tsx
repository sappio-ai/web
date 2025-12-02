'use client'

import { useState, FormEvent } from 'react'
import { validateEmail } from '@/lib/auth/validation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Orb from '@/components/orb/Orb'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orbPose, setOrbPose] = useState<'welcome-wave' | 'processing-thinking' | 'success-celebrating' | 'error-confused'>('welcome-wave')

  const isFormValid = email.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    setOrbPose('processing-thinking')

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setErrors({ email: emailValidation.error! })
      setLoading(false)
      setOrbPose('error-confused')
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Failed to send reset email' })
        setOrbPose('error-confused')
        setLoading(false)
        return
      }

      setSuccess(true)
      setOrbPose('success-celebrating')
      setLoading(false)
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
      setOrbPose('error-confused')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0F1A] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute left-0 top-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#a8d5d5]/[0.08] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 bottom-1/4 w-96 h-96 bg-gradient-to-br from-[#f5e6d3]/[0.06] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Left side - Branding & Mascot */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-2">
            <div className="relative mb-0.5">
              <Orb pose={orbPose} size="lg" className="w-40 h-40 drop-shadow-[0_8px_24px_rgba(168,213,213,0.3)]" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-36 h-7 bg-gradient-to-r from-transparent via-[#a8d5d5]/60 to-transparent blur-xl rounded-full" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-[#EAF2FF]">Reset your password</h2>
              <p className="text-base text-[#A9B4CA]">We&apos;ll send you a secure link</p>

              {/* How it works strip */}
              <div className="pt-3 space-y-1.5 text-sm text-[#A9B4CA]">
                <p className="font-medium text-[#EAF2FF] mb-1.5">How it works:</p>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">1</span>
                  <span className="text-sm">Enter your email address</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">2</span>
                  <span className="text-sm">Check your inbox for reset link</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">3</span>
                  <span className="text-sm">Create your new password</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form Card */}
          <div className="w-full max-w-md mx-auto">
            {/* Mobile mascot */}
            <div className="lg:hidden text-center mb-6">
              <div className="relative inline-block">
                <Orb pose={orbPose} size="lg" className="w-20 h-20 drop-shadow-[0_4px_12px_rgba(168,213,213,0.2)]" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gradient-to-r from-transparent via-[#a8d5d5]/30 to-transparent blur-lg rounded-full" />
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.07)] backdrop-blur-[10px] rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] border border-[#233047]">

              {/* Error banner */}
              {errors.general && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-400/20 rounded-2xl text-red-300 text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Success message */}
              {success ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-[#EAF2FF] mb-3">Check your email</h1>
                  <p className="text-[#A9B4CA] mb-6">
                    If an account exists with <span className="text-[#EAF2FF] font-medium">{email}</span>, you&apos;ll receive a password reset link shortly.
                  </p>
                  <p className="text-sm text-[#A9B4CA] mb-6">
                    The link will expire in 1 hour for security reasons.
                  </p>
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 text-[#a8d5d5] hover:text-[#f5e6d3] font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to login
                  </a>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-3.5">
                    <h1 className="text-2xl font-bold text-[#EAF2FF] mb-1">Forgot password?</h1>
                    <p className="text-sm text-[#A9B4CA]">No worries, we&apos;ll send you reset instructions</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      loading={loading}
                      disabled={!isFormValid || loading}
                    >
                      {loading ? 'Sending...' : 'Send reset link'}
                    </Button>

                    {/* Trust row */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#A9B4CA] pt-3">
                      <svg className="w-3.5 h-3.5 text-[#a8d5d5] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Secure reset link • Expires in 1 hour</span>
                    </div>
                  </form>

                  {/* Back to login link */}
                  <div className="mt-5 pt-5 border-t border-[#233047] text-center">
                    <a
                      href="/login"
                      className="inline-flex items-center gap-2 text-sm text-[#A9B4CA] hover:text-[#a8d5d5] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to login
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Footer links */}
            <div className="mt-4 flex justify-center items-center gap-3 text-xs text-[#A9B4CA]">
              <a href="/terms" className="hover:text-[#EAF2FF] transition-colors">Terms</a>
              <span className="text-[#233047]">•</span>
              <a href="/privacy" className="hover:text-[#EAF2FF] transition-colors">Privacy</a>
              <span className="text-[#233047]">•</span>
              <a href="/contact" className="hover:text-[#EAF2FF] transition-colors">Contact support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
