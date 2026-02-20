'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Sparkles, Zap, Crown, Gift, ArrowRight } from 'lucide-react'
import Orb from '@/components/orb/Orb'
import type { UsageStats } from '@/lib/types/usage'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  usage?: UsageStats
  trigger?: 'upload' | 'export' | 'bulk' | 'mindmap' | 'general'
  currentPlan?: 'free' | 'student_pro' | 'pro_plus'
}

const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: '€0',
    features: [
      '5 packs per month',
      '40 cards per pack',
      '15-question quizzes',
      '80 mind map nodes',
      'No exports',
    ],
  },
  student_pro: {
    name: 'Student Pro',
    monthlyPrice: '€7.99',
    yearlyPrice: '€69',
    semesterPrice: '€24',
    savingsText: 'Save €17/year',
    features: [
      '60 packs per month',
      '120 cards per pack',
      '30-question quizzes',
      '250 mind map nodes',
      'All export formats',
      'Timed quiz mode',
      'Weak topics practice',
      'Priority processing',
    ],
  },
  pro_plus: {
    name: 'Pro',
    monthlyPrice: '€11.99',
    yearlyPrice: '€129',
    savingsText: 'Save €25/year',
    features: [
      '300 packs per month',
      '300 cards per pack',
      '60-question quizzes',
      '800 mind map nodes',
      'All export formats',
      'Advanced analytics',
      'Priority processing',
      'API access (coming soon)',
    ],
  },
}

const MESSAGES = {
  upload: { title: "You've reached your monthly limit", orbPose: 'limit-reached' as const },
  export: { title: 'Unlock Exports', orbPose: 'upgrade-prompt' as const },
  bulk: { title: 'Bulk Upload Available', orbPose: 'upgrade-prompt' as const },
  mindmap: { title: 'Unlock Full Mind Maps', orbPose: 'upgrade-prompt' as const },
  general: { title: 'Upgrade Your Plan', orbPose: 'upgrade-prompt' as const },
}

export function PaywallModal({ isOpen, onClose, usage, trigger = 'general', currentPlan: propCurrentPlan }: PaywallModalProps) {
  const message = MESSAGES[trigger]
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<'free' | 'student_pro' | 'pro_plus'>(propCurrentPlan || 'free')
  const [fetchingPlan, setFetchingPlan] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleUpgrade = async (plan: 'student_pro' | 'pro_plus') => {
    try {
      setIsUpgrading(true)
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle: billingCycle === 'yearly' ? 'semester' : 'monthly' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error starting subscription:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    console.log('[PaywallModal] Component mounted')
    return () => {
      setMounted(false)
      console.log('[PaywallModal] Component unmounted')
    }
  }, [])

  // Fetch user's plan when modal opens if not provided
  useEffect(() => {
    if (isOpen && !propCurrentPlan && !fetchingPlan) {
      setFetchingPlan(true)
      
      const fetchUserPlan = async () => {
        try {
          const { createBrowserClient } = await import('@/lib/supabase/client')
          const supabase = createBrowserClient()
          
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase
              .from('users')
              .select('plan')
              .eq('auth_user_id', user.id)
              .single()
            
            if (profile?.plan) {
              setCurrentPlan(profile.plan as 'free' | 'student_pro' | 'pro_plus')
            }
          }
        } catch (error) {
          console.error('Error fetching user plan:', error)
        } finally {
          setFetchingPlan(false)
        }
      }
      
      fetchUserPlan()
    } else if (propCurrentPlan) {
      setCurrentPlan(propCurrentPlan)
    }
  }, [isOpen, propCurrentPlan, fetchingPlan])

  const handleClose = () => {
    console.log('[PaywallModal] Closing modal')
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (isOpen) {
      console.log('=== PAYWALL MODAL DEBUG START ===')
      console.log('[PaywallModal] Modal opened')
      console.log('[Window] scrollY:', window.scrollY)
      console.log('[Window] scrollX:', window.scrollX)
      console.log('[Window] innerHeight:', window.innerHeight)
      console.log('[Window] innerWidth:', window.innerWidth)
      console.log('[Document] body.scrollTop:', document.body.scrollTop)
      console.log('[Document] documentElement.scrollTop:', document.documentElement.scrollTop)
      console.log('[Document] body overflow:', document.body.style.overflow)
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose()
      }
      document.addEventListener('keydown', handleEscape)
      
      // Save original body styles
      const originalOverflow = document.body.style.overflow
      const originalTransform = document.body.style.transform
      
      // Remove transform from body to fix fixed positioning
      document.body.style.overflow = 'hidden'
      document.body.style.transform = 'none'
      
      console.log('[PaywallModal] Removed body transform to fix fixed positioning')
      
      // Comprehensive debugging after render
      setTimeout(() => {
        console.log('=== MODAL ELEMENT ANALYSIS ===')
        const modalElement = modalRef.current
        if (modalElement) {
          const rect = modalElement.getBoundingClientRect()
          const computedStyle = window.getComputedStyle(modalElement)
          
          console.log('[Modal] getBoundingClientRect:', {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height
          })
          
          console.log('[Modal] Computed styles:', {
            position: computedStyle.position,
            top: computedStyle.top,
            left: computedStyle.left,
            right: computedStyle.right,
            bottom: computedStyle.bottom,
            transform: computedStyle.transform,
            zIndex: computedStyle.zIndex,
            display: computedStyle.display,
            margin: computedStyle.margin,
            padding: computedStyle.padding
          })
          
          // Check parent chain for transforms
          console.log('=== PARENT CHAIN ANALYSIS ===')
          let parent = modalElement.parentElement
          let level = 0
          while (parent && level < 10) {
            const parentStyle = window.getComputedStyle(parent)
            const hasTransform = parentStyle.transform !== 'none'
            const hasPosition = parentStyle.position !== 'static'
            
            if (hasTransform || hasPosition) {
              console.log(`[Parent Level ${level}] ${parent.tagName}.${parent.className}:`, {
                transform: parentStyle.transform,
                position: parentStyle.position,
                overflow: parentStyle.overflow,
                zIndex: parentStyle.zIndex
              })
            }
            
            parent = parent.parentElement
            level++
          }
          
          // Check if modal is actually in document.body
          console.log('[Modal] Direct parent:', modalElement.parentElement?.tagName)
          console.log('[Modal] Is in body?', document.body.contains(modalElement))
          
          // Viewport calculations
          const viewportCenterY = window.innerHeight / 2
          const modalCenterY = rect.top + rect.height / 2
          const offsetFromCenter = modalCenterY - viewportCenterY
          
          console.log('[Centering] Viewport center Y:', viewportCenterY)
          console.log('[Centering] Modal center Y:', modalCenterY)
          console.log('[Centering] Offset from center:', offsetFromCenter)
          console.log('[Centering] Should be ~0 for perfect centering')
          
        } else {
          console.error('[PaywallModal] Modal ref is null!')
        }
        console.log('=== PAYWALL MODAL DEBUG END ===')
      }, 100)
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = originalOverflow
        document.body.style.transform = originalTransform
        console.log('[PaywallModal] Cleanup: body styles restored')
      }
    }
  }, [isOpen])

  if (!mounted || (!isOpen && !isClosing)) {
    return null
  }

  const isOverLimit = usage && usage.currentUsage > usage.limit

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-[#1A1D2E]/60 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Centered Modal with Paper Stack Effect */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%)`,
          zIndex: 101,
          width: '95vw',
          maxWidth: '42rem',
          maxHeight: '90vh',
        }}
      >
        {/* Paper stack backing */}
        <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-2xl border border-[#94A3B8]/25" />
        
        <div
          ref={modalRef}
          className={`relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.15),0_2px_8px_rgba(15,23,42,0.08)] border-2 border-[#5A5FF0]/30 transition-all duration-300 ease-out overflow-hidden flex flex-col
            ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          style={{ maxHeight: '90vh' }}
        >
          {/* Highlight accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#5A5FF0] to-transparent" />
          
          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            {/* Header */}
            <div className="bg-gradient-to-br from-white to-[#F8FAFB] px-6 pt-6 pb-4 border-b border-[#E2E8F0] flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Orb pose={message.orbPose} size="sm" animated={true} />
                  <h2 className="text-xl font-bold text-[#1A1D2E]">{message.title}</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              {/* Usage bar */}
              {usage && (
                <div className="mt-4 bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#64748B]">Monthly Usage</span>
                    <span className="text-sm font-bold text-[#1A1D2E]">
                      {usage.currentUsage} / {usage.limit}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOverLimit ? 'bg-[#F59E0B]' : 'bg-[#5A5FF0]'
                      }`}
                      style={{ width: `${Math.min((usage.currentUsage / usage.limit) * 100, 100)}%` }}
                    />
                  </div>
                  {isOverLimit && (
                    <div className="mt-2 flex items-center gap-2 text-[#92400E] text-xs font-semibold bg-[#FFFBEB] px-2 py-1.5 rounded border border-[#FCD34D]">
                      <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>You got 1 bonus pack! Upgrade for more.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Billing Toggle */}
          <div className="px-6 pt-6 pb-4">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#1A1D2E] shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1D2E]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-[#1A1D2E] shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1D2E]'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-[#10B981] text-white text-[9px] font-bold rounded-full shadow-sm uppercase tracking-wide">
                  Save
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="px-6 space-y-4 pb-4">
            {/* Student Pro - Highlighted */}
            <div className="relative">
              {/* Paper stack backing */}
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#5A5FF0]/25" />
              
              {currentPlan === 'student_pro' && (
                <div className="absolute -top-2 left-4 px-3 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full shadow-sm z-20 uppercase tracking-wide">
                  Current Plan
                </div>
              )}
              
              <div className={`relative rounded-xl border-2 ${currentPlan === 'student_pro' ? 'border-[#10B981] bg-gradient-to-br from-white to-[#ECFDF5]' : 'border-[#5A5FF0] bg-gradient-to-br from-white to-[#EEF2FF]'} p-5 shadow-[0_4px_16px_rgba(90,95,240,0.15)]`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#1A1D2E]">{PLANS.student_pro.name}</h3>
                      {currentPlan === 'student_pro' && (
                        <Check className="w-5 h-5 text-[#10B981]" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-[#1A1D2E]">
                        {billingCycle === 'monthly' ? PLANS.student_pro.monthlyPrice : PLANS.student_pro.yearlyPrice}
                      </span>
                      <span className="text-sm text-[#64748B]">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-[#10B981] text-xs font-bold">{PLANS.student_pro.savingsText}</p>
                    )}
                    {billingCycle === 'monthly' && (
                      <p className="text-[#5A5FF0] text-xs font-bold">or {PLANS.student_pro.semesterPrice}/semester</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#5A5FF0] flex items-center justify-center shadow-sm flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {PLANS.student_pro.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#1A1D2E] text-sm font-medium">
                      <Check className="w-4 h-4 text-[#5A5FF0] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {currentPlan === 'student_pro' ? (
                  <div className="w-full py-3 bg-[#ECFDF5] text-[#10B981] font-bold rounded-lg text-sm text-center border-2 border-[#10B981]">
                    Your Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade('student_pro')}
                    disabled={isUpgrading}
                    className="w-full py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isUpgrading ? 'Redirecting...' : 'Upgrade to Student Pro'}</span>
                    {!isUpgrading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Pro */}
            <div className="relative">
              {/* Paper stack backing */}
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#F59E0B]/25" />
              
              {currentPlan === 'pro_plus' && (
                <div className="absolute -top-2 left-4 px-3 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full shadow-sm z-20 uppercase tracking-wide">
                  Current Plan
                </div>
              )}
              
              <div className={`relative rounded-xl border-2 ${currentPlan === 'pro_plus' ? 'border-[#10B981] bg-gradient-to-br from-white to-[#ECFDF5]' : 'border-[#E2E8F0] bg-white hover:border-[#F59E0B]/40'} p-5 transition-all shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#1A1D2E]">{PLANS.pro_plus.name}</h3>
                      {currentPlan === 'pro_plus' && (
                        <Check className="w-5 h-5 text-[#10B981]" strokeWidth={3} />
                      )}
                    </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-[#1A1D2E]">
                      {billingCycle === 'monthly' ? PLANS.pro_plus.monthlyPrice : PLANS.pro_plus.yearlyPrice}
                    </span>
                    <span className="text-sm text-[#64748B]">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-[#10B981] text-xs font-bold">{PLANS.pro_plus.savingsText}</p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#F59E0B] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {PLANS.pro_plus.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#1A1D2E] text-sm">
                    <Check className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
                {currentPlan === 'pro_plus' ? (
                  <div className="w-full py-3 bg-[#ECFDF5] text-[#10B981] font-bold rounded-lg text-sm text-center border-2 border-[#10B981]">
                    Your Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade('pro_plus')}
                    disabled={isUpgrading}
                    className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isUpgrading ? 'Redirecting...' : 'Upgrade to Pro'}</span>
                    {!isUpgrading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Free Plan - Collapsed */}
            {currentPlan === 'free' && (
              <div className="relative">
                {/* Paper stack backing */}
                <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#10B981]/25" />
                
                <div className="absolute -top-2 left-4 px-3 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full shadow-sm z-20 uppercase tracking-wide">
                  Current Plan
                </div>
                
                <div className="relative rounded-xl border-2 border-[#10B981] bg-gradient-to-br from-white to-[#ECFDF5] p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#1A1D2E]">{PLANS.free.name}</h3>
                          <Check className="w-4 h-4 text-[#10B981]" strokeWidth={3} />
                        </div>
                        <p className="text-xs text-[#10B981] font-semibold">Your Current Plan</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#1A1D2E]">{PLANS.free.monthlyPrice}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#F8FAFB] border-t border-[#E2E8F0] flex-shrink-0">
            <p className="text-[#64748B] text-xs text-center">
              All plans include secure storage, AI-powered generation, and mobile access
            </p>
            <p className="text-[#94A3B8] text-[10px] text-center mt-1">
              Cancel anytime • No hidden fees • Student verification available
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )

  // Render using portal to escape any transformed parent containers
  return createPortal(modalContent, document.body)
}
