'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { validateEmail, validatePassword, validatePasswordMatch } from '@/lib/auth/validation'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import Orb from '@/components/orb/Orb'
import { Lock, CheckCircle } from 'lucide-react'

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [orbPose, setOrbPose] = useState<'welcome-wave' | 'processing-thinking' | 'success-celebrating' | 'error-confused'>('welcome-wave')
  
  // Waitlist mode state
  const [waitlistModeEnabled, setWaitlistModeEnabled] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [codeValidated, setCodeValidated] = useState(false)
  const [validatingCode, setValidatingCode] = useState(false)
  const [checkingMode, setCheckingMode] = useState(true)
  
  const isFormValid = email.length > 0 && password.length > 0 && confirmPassword.length > 0

  // Check waitlist mode and pre-fill invite code from URL
  useEffect(() => {
    const checkWaitlistMode = async () => {
      try {
        const response = await fetch('/api/waitlist/validate-code')
        const data = await response.json()
        setWaitlistModeEnabled(data.waitlistModeEnabled)
        
        // Pre-fill code from URL if present
        const urlCode = searchParams.get('invite')
        if (urlCode && data.waitlistModeEnabled) {
          setInviteCode(urlCode)
          // Auto-validate if code is in URL
          validateInviteCode(urlCode)
        }
      } catch (error) {
        console.error('Error checking waitlist mode:', error)
      } finally {
        setCheckingMode(false)
      }
    }
    
    checkWaitlistMode()
  }, [searchParams])

  const validateInviteCode = async (code: string) => {
    if (!code.trim()) return
    
    setValidatingCode(true)
    setErrors({})
    
    try {
      const response = await fetch('/api/waitlist/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })
      
      const data = await response.json()
      
      if (data.valid) {
        setCodeValidated(true)
        setEmail(data.email) // Pre-fill email from waitlist
        setOrbPose('success-celebrating')
        setTimeout(() => setOrbPose('welcome-wave'), 1000)
      } else {
        setErrors({ inviteCode: data.error || 'Invalid invite code' })
        setOrbPose('error-confused')
        setTimeout(() => setOrbPose('welcome-wave'), 1500)
      }
    } catch (error) {
      setErrors({ inviteCode: 'Failed to validate code' })
      setOrbPose('error-confused')
    } finally {
      setValidatingCode(false)
    }
  }

  const handleValidateCode = (e: FormEvent) => {
    e.preventDefault()
    validateInviteCode(inviteCode)
  }

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
    <div className="min-h-screen w-full bg-[#F8FAFB] relative overflow-hidden">
      {/* Subtle paper texture - left half only */}
      <div className="absolute inset-y-0 left-0 right-1/2 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      {/* Content Container */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">
          
          {/* Left side - Branding & Mascot */}
          <div className="hidden lg:flex flex-col justify-center space-y-10 pl-8 relative">
            {/* Subtle dot grid background - left half only */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #1A1D2E 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
            
            {/* Soft radial behind mascot */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#5A5FF0]/[0.03] rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 max-w-md relative z-10">
              <div className="relative inline-block">
                <Orb pose={orbPose} size="lg" className="w-28 h-28" />
              </div>
              <div className="space-y-3">
                <h2 className="text-[36px] font-bold text-[#1A1D2E] leading-[1.15] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                  Start learning with <span className="relative inline-block">
                    <span className="relative z-10">Sappio</span>
                    <span className="absolute bottom-[0.15em] left-0 right-0 h-[0.35em] bg-[#FFE08A]/50 -z-10" />
                  </span>
                </h2>
                <p className="text-[17px] text-[#4A5568] leading-relaxed">
                  One upload. Full study pack.
                </p>
              </div>

              {/* How it works - editorial timeline style */}
              <div className="pt-6 space-y-5 relative">
                {/* Vertical editorial rule */}
                <div className="absolute left-[11px] top-12 bottom-0 w-[1px] bg-[#CBD5E1]/40" />
                
                <div className="flex items-center gap-2.5">
                  {/* Tiny bookmark tab symbol */}
                  <div className="relative">
                    <div className="w-[14px] h-[16px] bg-[#5A5FF0] rounded-b-[3px] shadow-sm" />
                  </div>
                  <p className="text-[10px] font-semibold text-[#1A1D2E] uppercase tracking-[0.1em]" style={{ letterSpacing: '0.1em' }}>How it works</p>
                </div>
                <div className="space-y-5 relative">
                  {/* Step 1 - Active */}
                  <div className="flex items-start gap-4 relative">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5A5FF0] flex items-center justify-center relative z-10">
                      <span className="text-[11px] text-white font-bold">1</span>
                    </div>
                    <span className="text-[15px] text-[#1A1D2E] leading-relaxed pt-0.5">Upload your study material</span>
                  </div>
                  {/* Step 2 - Outline */}
                  <div className="flex items-start gap-4 relative">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-[#5A5FF0]/40 flex items-center justify-center relative z-10">
                      <span className="text-[11px] text-[#5A5FF0]/70 font-bold">2</span>
                    </div>
                    <span className="text-[15px] text-[#1A1D2E] leading-relaxed pt-0.5">AI generates your study pack</span>
                  </div>
                  {/* Step 3 - Outline */}
                  <div className="flex items-start gap-4 relative">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-[#5A5FF0]/40 flex items-center justify-center relative z-10">
                      <span className="text-[11px] text-[#5A5FF0]/70 font-bold">3</span>
                    </div>
                    <span className="text-[15px] text-[#1A1D2E] leading-relaxed pt-0.5">Learn smarter, not harder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form Card with Paper Stack */}
          <div className="w-full">
            {/* Mobile mascot - stacked above */}
            <div className="lg:hidden text-center mb-8">
              <div className="relative inline-block mb-4">
                <Orb pose={orbPose} size="lg" className="w-20 h-20" />
              </div>
              <h2 className="text-[28px] font-bold text-[#1A1D2E] mb-2 leading-tight tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                Start learning with <span className="relative inline-block">
                  <span className="relative z-10">Sappio</span>
                  <span className="absolute bottom-[0.15em] left-0 right-0 h-[0.35em] bg-[#FFE08A]/50 -z-10" />
                </span>
              </h2>
              <p className="text-[15px] text-[#4A5568]">One upload. Full study pack.</p>
            </div>

            {/* Paper Shadow Container */}
            <div className="relative">
              {/* Paper Shadow Effect */}
              <div className="absolute inset-0 bg-[#1A1D2E] rounded-3xl translate-y-3 translate-x-3" />
              
              {/* Main card */}
              <div className="relative bg-white rounded-3xl border-2 border-[#1A1D2E] overflow-hidden">
                {/* Decorative Corner Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFDE59] rounded-bl-[60px] opacity-20" />
                
                {/* Bookmark Tab */}
                <div className="absolute -top-[2px] right-12 w-[28px] h-[22px] bg-[#5A5FF0] rounded-b-[5px] shadow-[0_2px_4px_rgba(90,95,240,0.3)]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
                </div>
                
                {/* Paper header detail */}
                <div className="px-8 pt-6 pb-4 border-b border-[#E2E8F0]/60">
                  <span className="text-[9px] font-semibold text-[#4A5568] uppercase tracking-[0.18em]">Registration</span>
                </div>
                
                {/* Main content area */}
                <div className="p-8 pt-6">
              
                  {/* Loading state while checking mode */}
                  {checkingMode ? (
                    <div className="py-12 text-center">
                      <div className="inline-block w-8 h-8 border-3 border-[#5A5FF0]/30 border-t-[#5A5FF0] rounded-full animate-spin" />
                      <p className="text-[14px] text-[#64748B] mt-4">Loading...</p>
                    </div>
                  ) : waitlistModeEnabled && !codeValidated ? (
                    /* Invite Code Input Screen */
                    <>
                      {/* Header */}
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-[#5A5FF0]/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-[#5A5FF0]" />
                          </div>
                          <h1 className="text-[34px] font-bold text-[#1A1D2E] tracking-[-0.02em] leading-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>Invite Only</h1>
                        </div>
                        <p className="text-[15px] text-[#4A5568]">Enter your invite code to create an account</p>
                      </div>

                      {/* Error banner */}
                      {errors.inviteCode && (
                        <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-[#991B1B] text-[14px] flex items-start gap-3">
                          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{errors.inviteCode}</span>
                        </div>
                      )}

                      {/* Invite Code Form */}
                      <form onSubmit={handleValidateCode} className="space-y-6">
                        <div>
                          <label className="block text-[13px] font-semibold text-[#1A1D2E] mb-2">
                            Invite Code
                          </label>
                          <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="INV-XXXXXXXX"
                            disabled={validatingCode}
                            className="w-full h-12 px-4 bg-white border border-[#CBD5E1] rounded-xl text-[15px] text-[#1A1D2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:border-[#5A5FF0] disabled:bg-[#F8FAFB] disabled:cursor-not-allowed transition-all font-mono tracking-wider"
                            required
                          />
                          <p className="text-[13px] text-[#64748B] mt-2">
                            Check your email for your unique invite code
                          </p>
                        </div>

                        {/* Button with Paper Shadow */}
                        <div className="relative group/btn">
                          <div className="absolute inset-0 bg-[#1A1D2E] rounded-xl translate-y-1.5 translate-x-1.5 transition-transform group-hover/btn:translate-y-2 group-hover/btn:translate-x-2" />
                          <button
                            type="submit"
                            disabled={!inviteCode.trim() || validatingCode}
                            className="relative w-full h-12 px-6 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold text-[15px] rounded-xl border-2 border-[#1A1D2E] transition-colors disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed disabled:border-[#E2E8F0]"
                          >
                            {validatingCode ? 'Validating...' : 'Continue'}
                          </button>
                        </div>
                      </form>

                      {/* Info box */}
                      <div className="mt-8 p-4 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-[#0284C7] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-[13px] text-[#0C4A6E]">
                            <p className="font-semibold mb-1">Don&apos;t have an invite code?</p>
                            <p>Join our waitlist to get early access and exclusive benefits.</p>
                            <a href="/waitlist" className="inline-block mt-2 text-[#0284C7] hover:text-[#0369A1] font-semibold transition-colors">
                              Join waitlist →
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Switch link */}
                      <div className="mt-7 pt-6 border-t border-[#E2E8F0] text-center">
                        <p className="text-[14px] text-[#4A5568]">
                          Already have an account?{' '}
                          <a href="/login" className="text-[#5A5FF0] hover:text-[#4A4FD0] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-1">
                            Log in
                          </a>
                        </p>
                      </div>
                    </>
                  ) : (
                    /* Regular Signup Form */
                    <>
                      {/* Error banner */}
                      {errors.general && (
                        <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-[#991B1B] text-[14px] flex items-start gap-3">
                          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{errors.general}</span>
                        </div>
                      )}

                      {/* Success message if code was validated */}
                      {waitlistModeEnabled && codeValidated && (
                        <div className="mb-6 p-4 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl text-[#166534] text-[14px] flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Invite code verified!</p>
                            <p className="text-[13px] mt-1">Complete your registration below</p>
                          </div>
                        </div>
                      )}

                      {/* Header */}
                      <div className="mb-8">
                        <h1 className="text-[34px] font-bold text-[#1A1D2E] tracking-[-0.02em] leading-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>Create account</h1>
                        <p className="text-[15px] text-[#4A5568] mt-2">Start learning smarter today</p>
                      </div>

                      {/* SSO - Hidden when waitlist mode is enabled */}
                      {!waitlistModeEnabled && (
                        <>
                          <button
                            type="button"
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full h-12 px-6 bg-white hover:bg-[#F8FAFB] text-[#1A1D2E] font-medium text-[15px] rounded-xl transition-all duration-150 flex items-center justify-center gap-3 border border-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                          </button>
                          <p className="text-center text-[13px] text-[#64748B] mt-2 mb-5">We&apos;ll never post without your permission</p>

                          {/* Divider - cleaner and lighter */}
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-[#E2E8F0]/60" />
                            </div>
                            <div className="relative flex justify-center">
                              <span className="px-4 bg-white text-[#94A3B8] text-[10px] font-medium uppercase tracking-[0.1em]">or</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Form */}
                      <form onSubmit={handleEmailPasswordSignup} className="space-y-5">
                        <Input
                          type="email"
                          label="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          error={errors.email}
                          placeholder="you@example.com"
                          disabled={loading || (waitlistModeEnabled && codeValidated)}
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

                        {/* Button with Paper Shadow */}
                        <div className="relative group/btn mt-6">
                          <div className="absolute inset-0 bg-[#1A1D2E] rounded-xl translate-y-1.5 translate-x-1.5 transition-transform group-hover/btn:translate-y-2 group-hover/btn:translate-x-2" />
                          <button
                            type="submit"
                            disabled={!isFormValid || loading}
                            className="relative w-full h-12 px-6 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold text-[15px] rounded-xl border-2 border-[#1A1D2E] transition-colors disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed disabled:border-[#E2E8F0]"
                          >
                            {loading ? 'Creating account...' : 'Create account'}
                          </button>
                        </div>
                      </form>

                      {/* Switch link */}
                      <div className="mt-7 pt-6 border-t border-[#E2E8F0] text-center">
                        <p className="text-[14px] text-[#4A5568]">
                          Already have an account?{' '}
                          <a href="/login" className="text-[#5A5FF0] hover:text-[#4A4FD0] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-1">
                            Log in
                          </a>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer links */}
            <div className="mt-8 flex justify-center items-center gap-4 text-[13px] text-[#64748B]">
              <a href="/terms" className="hover:text-[#5A5FF0] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-1">Terms</a>
              <span className="text-[#CBD5E1]">•</span>
              <a href="/privacy" className="hover:text-[#5A5FF0] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-1">Privacy</a>
              <span className="text-[#CBD5E1]">•</span>
              <a href="/contact" className="hover:text-[#5A5FF0] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-1">Support</a>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
