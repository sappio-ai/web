'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { validateEmail, validatePassword, validatePasswordMatch } from '@/lib/auth/validation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import Orb from '@/components/orb/Orb'

export default function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [orbPose, setOrbPose] = useState<'welcome-wave' | 'processing-thinking' | 'success-celebrating' | 'error-confused'>('welcome-wave')
  
  const isFormValid = email.length > 0 && password.length > 0 && confirmPassword.length > 0

  const handleEmailPasswordSignup = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    setOrbPose('processing-thinking')

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)
    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)

    const newErrors: Record<string, string> = {}
    if (!emailValidation.valid) newErrors.email = emailValidation.error!
    if (!passwordValidation.valid) newErrors.password = passwordValidation.error!
    if (!passwordMatchValidation.valid) newErrors.confirmPassword = passwordMatchValidation.error!

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      setOrbPose('error-confused')
      return
    }

    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      })

      if (error) {
        setErrors({ general: error.message })
        setOrbPose('error-confused')
        setLoading(false)
        return
      }

      if (!data.user) {
        setErrors({ general: 'Failed to create account' })
        setOrbPose('error-confused')
        setLoading(false)
        return
      }

      fetch('/api/auth/post-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email: data.user.email }),
      }).catch(() => {})

      setOrbPose('success-celebrating')
      setTimeout(() => router.push('/dashboard'), 800)
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
      setOrbPose('error-confused')
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setOrbPose('processing-thinking')

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        setErrors({ general: error.message })
        setOrbPose('error-confused')
        setLoading(false)
      }
    } catch (error) {
      setErrors({ general: 'Failed to initiate Google sign up' })
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
      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left side - Branding & Value Prop */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-3">
            <div className="relative mb-1">
              <Orb pose={orbPose} size="lg" className="w-40 h-40 drop-shadow-[0_8px_24px_rgba(168,213,213,0.3)]" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-36 h-7 bg-gradient-to-r from-transparent via-[#a8d5d5]/60 to-transparent blur-xl rounded-full" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-[#EAF2FF]">Start learning smarter</h2>
              <p className="text-base text-[#A9B4CA]">One upload. Full study pack.</p>
              
              {/* How it works strip - tighter spacing */}
              <div className="pt-2 space-y-1 text-sm text-[#A9B4CA]">
                <p className="font-medium text-[#EAF2FF] mb-1">How it works:</p>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">1</span>
                  <span className="text-sm">Upload your study material</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">2</span>
                  <span className="text-sm">Auto Study Pack generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center text-xs text-[#a8d5d5] font-semibold">3</span>
                  <span className="text-sm">Learn smarter, not harder</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile mascot - stacked above */}
            <div className="lg:hidden text-center mb-6">
              <div className="relative inline-block mb-3">
                <Orb pose={orbPose} size="lg" className="w-20 h-20 drop-shadow-[0_4px_12px_rgba(168,213,213,0.2)]" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gradient-to-r from-transparent via-[#a8d5d5]/30 to-transparent blur-lg rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-[#EAF2FF] mb-1">Start learning smarter</h2>
              <p className="text-sm text-[#A9B4CA]">One upload. Full study pack.</p>
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

              {/* Header - desktop only */}
              <div className="mb-3.5 hidden lg:block">
                <h1 className="text-2xl font-bold text-[#EAF2FF] mb-1">Create your account</h1>
                <p className="text-sm text-[#A9B4CA]">Start learning smarter today</p>
              </div>

              {/* SSO - full width on mobile */}
              <Button
                type="button"
                variant="primary"
                className="w-full mb-1"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              <p className="text-center text-xs text-[#A9B4CA]/80 mb-5">We&apos;ll never post without your permission</p>

              {/* Divider - consistent weight */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2B3447]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2.5 py-0.5 bg-[rgba(255,255,255,0.07)] text-[#A9B4CA] text-[11px] rounded-full border border-[#233047]">or</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailPasswordSignup} className="space-y-4">
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

                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  placeholder="At least 8 characters"
                  helperText="Use 8+ characters with letters and numbers"
                  showStrength={true}
                  disabled={loading}
                  required
                />

                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Re-enter your password"
                  disabled={loading}
                  required
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full mt-5" 
                  loading={loading}
                  disabled={!isFormValid || loading}
                >
                  {loading ? 'Creating your account...' : isFormValid ? 'Create your free account' : 'Fill in all fields'}
                </Button>

                {/* Trust row - single line on mobile */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#A9B4CA]/80 pt-3">
                  <svg className="w-3.5 h-3.5 text-[#a8d5d5] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="hidden sm:inline">No card required • No spam • <a href="/privacy" className="hover:text-[#a8d5d5] transition-colors underline focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/40 rounded">Privacy</a></span>
                  <span className="sm:hidden">Private by default • <a href="/privacy" className="hover:text-[#a8d5d5] transition-colors underline focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/40 rounded">Privacy</a></span>
                </div>
              </form>

              {/* Switch link */}
              <div className="mt-5 pt-5 border-t border-[#233047] text-center">
                <p className="text-sm text-[#A9B4CA]">
                  Already have an account?{' '}
                  <a href="/login" className="text-[#a8d5d5] hover:text-[#f5e6d3] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/40 rounded">
                    Log in
                  </a>
                </p>
              </div>
            </div>

            {/* Footer links */}
            <div className="mt-4 flex justify-center items-center gap-3 text-xs text-[#A9B4CA]">
              <a href="/terms" className="hover:text-[#EAF2FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/40 rounded">Terms</a>
              <span className="text-[#233047]">•</span>
              <a href="/privacy" className="hover:text-[#EAF2FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/40 rounded">Privacy</a>
              <span className="text-[#233047]">•</span>
              <a href="/contact" className="hover:text-[#EAF2FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/40 rounded">Contact support</a>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
