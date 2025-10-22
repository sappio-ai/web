'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { validatePassword, validatePasswordMatch } from '@/lib/auth/validation'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/ui/PasswordInput'
import Orb from '@/components/orb/Orb'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [orbPose, setOrbPose] = useState<'welcome-wave' | 'processing-thinking' | 'success-celebrating' | 'error-confused'>('welcome-wave')

  const isFormValid = password.length > 0 && confirmPassword.length > 0

  useEffect(() => {
    if (!token) {
      setErrors({ general: 'Invalid or missing reset token' })
      setOrbPose('error-confused')
    }
  }, [token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    setOrbPose('processing-thinking')

    if (!token) {
      setErrors({ general: 'Invalid or missing reset token' })
      setOrbPose('error-confused')
      setLoading(false)
      return
    }

    const passwordValidation = validatePassword(password)
    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)

    const newErrors: Record<string, string> = {}
    if (!passwordValidation.valid) newErrors.password = passwordValidation.error!
    if (!passwordMatchValidation.valid) newErrors.confirmPassword = passwordMatchValidation.error!

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      setOrbPose('error-confused')
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Failed to reset password' })
        setOrbPose('error-confused')
        setLoading(false)
        return
      }

      setOrbPose('success-celebrating')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2000)
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
              <h2 className="text-2xl font-bold text-[#EAF2FF]">Create new password</h2>
              <p className="text-base text-[#A9B4CA]">Choose a strong, unique password</p>
              
              {/* How it works strip */}
              <div className="pt-3 space-y-1.5 text-sm text-[#A9B4CA]">
                <p className="font-medium text-[#EAF2FF] mb-1.5">Password tips:</p>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">✓</span>
                  <span className="text-sm">At least 8 characters long</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">✓</span>
                  <span className="text-sm">Mix of letters and numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">✓</span>
                  <span className="text-sm">Unique to this account</span>
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

              {/* Success state */}
              {orbPose === 'success-celebrating' ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-[#EAF2FF] mb-3">Password reset successful!</h1>
                  <p className="text-[#A9B4CA] mb-6">
                    Your password has been updated. Redirecting you to login...
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-3.5">
                    <h1 className="text-2xl font-bold text-[#EAF2FF] mb-1">Reset your password</h1>
                    <p className="text-sm text-[#A9B4CA]">Enter your new password below</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordInput
                      label="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      placeholder="At least 8 characters"
                      helperText="Use 8+ characters with letters and numbers"
                      showStrength={true}
                      disabled={loading || !token}
                      required
                    />

                    <PasswordInput
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      placeholder="Re-enter your password"
                      disabled={loading || !token}
                      required
                    />

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full mt-5" 
                      loading={loading}
                      disabled={!isFormValid || loading || !token}
                    >
                      {loading ? 'Resetting password...' : 'Reset password'}
                    </Button>

                    {/* Trust row */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#A9B4CA] pt-3">
                      <svg className="w-3.5 h-3.5 text-[#a8d5d5] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Secure connection • Password encrypted</span>
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
