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

export function PaywallModal({ isOpen, onClose, usage, trigger = 'general', currentPlan = 'free' }: PaywallModalProps) {
  const message = MESSAGES[trigger]
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    console.log('[PaywallModal] Component mounted')
    return () => {
      setMounted(false)
      console.log('[PaywallModal] Component unmounted')
    }
  }, [])

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
        className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Centered Modal */}
      <div
        ref={modalRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${isClosing ? 0.95 : 1})`,
          zIndex: 101,
          width: '95vw',
          maxWidth: '42rem',
          maxHeight: '90vh',
        }}
        className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ease-out overflow-hidden flex flex-col
          ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Orb pose={message.orbPose} size="sm" animated={true} />
                <h2 className="text-xl font-bold text-gray-900">{message.title}</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Usage bar */}
            {usage && (
              <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
                  <span className="text-sm font-bold text-gray-900">
                    {usage.currentUsage} / {usage.limit}
                  </span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-200">
                  <div
                    className={`h-full transition-all ${
                      isOverLimit ? 'bg-orange-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min((usage.currentUsage / usage.limit) * 100, 100)}%` }}
                  />
                </div>
                {isOverLimit && (
                  <div className="mt-2 flex items-center gap-2 text-orange-900 text-xs font-medium bg-orange-50 px-2 py-1.5 rounded border border-orange-200">
                    <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>You got 1 bonus pack! Upgrade for more.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Billing Toggle */}
          <div className="px-6 pt-6 pb-4">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                  SAVE
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="px-6 space-y-4 pb-4">
            {/* Student Pro - Highlighted */}
            <div className="relative">
              {currentPlan === 'student_pro' ? (
                <div className="absolute -top-2 left-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-sm z-10">
                  CURRENT PLAN
                </div>
              ) : (
                <div className="absolute -top-2 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm z-10">
                  MOST POPULAR
                </div>
              )}
              
              <div className={`relative rounded-xl border-2 ${currentPlan === 'student_pro' ? 'border-green-600 bg-gradient-to-br from-white to-green-50' : 'border-blue-600 bg-gradient-to-br from-white to-blue-50'} p-5 shadow-lg`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{PLANS.student_pro.name}</h3>
                      {currentPlan === 'student_pro' && (
                        <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {billingCycle === 'monthly' ? PLANS.student_pro.monthlyPrice : PLANS.student_pro.yearlyPrice}
                      </span>
                      <span className="text-sm text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-green-600 text-xs font-bold">{PLANS.student_pro.savingsText}</p>
                    )}
                    {billingCycle === 'monthly' && (
                      <p className="text-blue-600 text-xs font-bold">or {PLANS.student_pro.semesterPrice}/semester</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {PLANS.student_pro.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-900 text-sm font-medium">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {currentPlan === 'student_pro' ? (
                  <div className="w-full py-3 bg-green-100 text-green-800 font-bold rounded-lg text-sm text-center border-2 border-green-600">
                    Your Current Plan
                  </div>
                ) : (
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group">
                    <span>Upgrade to Student Pro</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Pro */}
            <div className="relative">
              {currentPlan === 'pro_plus' && (
                <div className="absolute -top-2 left-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-sm z-10">
                  CURRENT PLAN
                </div>
              )}
              
              <div className={`relative rounded-xl border-2 ${currentPlan === 'pro_plus' ? 'border-green-600 bg-gradient-to-br from-white to-green-50' : 'border-gray-200 bg-white hover:border-orange-500'} p-5 transition-all shadow-lg`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{PLANS.pro_plus.name}</h3>
                      {currentPlan === 'pro_plus' && (
                        <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                      )}
                    </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {billingCycle === 'monthly' ? PLANS.pro_plus.monthlyPrice : PLANS.pro_plus.yearlyPrice}
                    </span>
                    <span className="text-sm text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-green-600 text-xs font-bold">{PLANS.pro_plus.savingsText}</p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {PLANS.pro_plus.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
                {currentPlan === 'pro_plus' ? (
                  <div className="w-full py-3 bg-green-100 text-green-800 font-bold rounded-lg text-sm text-center border-2 border-green-600">
                    Your Current Plan
                  </div>
                ) : (
                  <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group">
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Free Plan - Collapsed */}
            {currentPlan === 'free' && (
              <div className="relative">
                <div className="absolute -top-2 left-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-sm z-10">
                  CURRENT PLAN
                </div>
                
                <div className="relative rounded-xl border-2 border-green-600 bg-gradient-to-br from-white to-green-50 p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{PLANS.free.name}</h3>
                          <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                        </div>
                        <p className="text-xs text-green-600 font-semibold">Your Current Plan</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{PLANS.free.monthlyPrice}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <p className="text-gray-600 text-xs text-center">
              All plans include secure storage, AI-powered generation, and mobile access
            </p>
            <p className="text-gray-500 text-[10px] text-center mt-1">
              Cancel anytime • No hidden fees • Student verification available
            </p>
          </div>
        </div>
      </div>
    </>
  )

  // Render using portal to escape any transformed parent containers
  return createPortal(modalContent, document.body)
}
