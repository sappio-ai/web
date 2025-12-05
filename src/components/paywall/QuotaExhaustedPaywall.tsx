'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Check, Sparkles, Package, Calendar, ArrowRight, AlertCircle } from 'lucide-react'
import Orb from '@/components/orb/Orb'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import type { UsageStats } from '@/lib/types/usage'

interface QuotaExhaustedPaywallProps {
  isOpen: boolean
  onClose: () => void
  usage?: UsageStats
  currentPlan?: 'free' | 'student_pro' | 'pro_plus'
}

const EXTRA_PACK_BUNDLES = [
  {
    quantity: 10,
    price: 2.99,
    pricePerPack: 0.299,
    popular: false,
  },
  {
    quantity: 30,
    price: 6.99,
    pricePerPack: 0.233,
    popular: true,
  },
  {
    quantity: 75,
    price: 14.99,
    pricePerPack: 0.2,
    popular: false,
  },
]

export function QuotaExhaustedPaywall({
  isOpen,
  onClose,
  usage,
  currentPlan = 'free',
}: QuotaExhaustedPaywallProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState<number | null>(30) // Default to 30-pack
  const [showPaywallModal, setShowPaywallModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose()
      }
      document.addEventListener('keydown', handleEscape)

      const originalOverflow = document.body.style.overflow
      const originalTransform = document.body.style.transform

      document.body.style.overflow = 'hidden'
      document.body.style.transform = 'none'

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = originalOverflow
        document.body.style.transform = originalTransform
      }
    }
  }, [isOpen])

  const handlePurchase = async (quantity: number) => {
    setIsPurchasing(true)
    try {
      const response = await fetch('/api/payments/extra-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to start checkout. Please try again.')
      setIsPurchasing(false)
    }
  }

  if (!mounted || (!isOpen && !isClosing)) {
    return null
  }

  const periodEnd = usage?.periodEnd ? new Date(usage.periodEnd) : null
  const daysUntilReset = periodEnd
    ? Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

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
                  <Orb pose="limit-reached" size="sm" animated={true} />
                  <h2 className="text-xl font-bold text-[#1A1D2E]">Monthly Limit Reached</h2>
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
                      className="h-full bg-[#F59E0B] transition-all"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[#64748B]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

          {/* Extra Packs Section */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1D2E]">Buy Extra Packs</h3>
              <span className="px-2 py-0.5 bg-[#5A5FF0]/10 text-[#5A5FF0] text-xs font-bold rounded-full uppercase tracking-wide">
                One-Time
              </span>
            </div>
            <p className="text-sm text-[#64748B] mb-4">
              Purchase additional packs that roll over across months. Valid for 6 months.
            </p>

            {/* Bundle Cards */}
            <div className="space-y-3">
              {EXTRA_PACK_BUNDLES.map((bundle) => (
                <div key={bundle.quantity} className="relative">
                  {/* Paper stack effect for selected */}
                  {selectedBundle === bundle.quantity && (
                    <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#5A5FF0]/25" />
                  )}
                  
                  <button
                    onClick={() => setSelectedBundle(bundle.quantity)}
                    disabled={isPurchasing}
                    className={`group relative w-full text-left rounded-xl border-2 p-4 transition-all overflow-hidden ${
                      selectedBundle === bundle.quantity
                        ? 'border-[#5A5FF0] bg-gradient-to-br from-[#EEF2FF] to-white shadow-[0_4px_16px_rgba(90,95,240,0.15)]'
                        : 'border-[#E2E8F0] hover:border-[#5A5FF0]/40 bg-white'
                    } ${isPurchasing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {/* Bookmark for popular */}
                    {bundle.popular && (
                      <div className="absolute -top-0 right-8 w-[20px] h-[16px] bg-[#5A5FF0] rounded-b-[3px] shadow-sm z-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[14px] h-[2px] bg-[#4A4FD0] rounded-t-sm" />
                      </div>
                    )}
                    
                    {/* Decorative Orb Image - Bottom Right */}
                    <div className="absolute -bottom-4 right-[30] w-24 h-24 opacity-[0.14] group-hover:opacity-[0.22] transition-opacity pointer-events-none">
                      <Image
                        src="/orb/sp_pc.png"
                        alt=""
                        width={96}
                        height={96}
                        className="object-contain"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-[#1A1D2E]">
                            {bundle.quantity} Packs
                          </span>
                          {bundle.popular && (
                            <span className="px-2 py-0.5 bg-[#5A5FF0] text-white text-xs font-bold rounded-full uppercase tracking-wide">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[#1A1D2E]">
                            €{bundle.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-[#64748B]">
                            (€{bundle.pricePerPack.toFixed(2)}/pack)
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedBundle === bundle.quantity
                            ? 'border-[#5A5FF0] bg-[#5A5FF0]'
                            : 'border-[#CBD5E1]'
                        }`}
                      >
                        {selectedBundle === bundle.quantity && (
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Purchase Button */}
            <button
              onClick={() => selectedBundle && handlePurchase(selectedBundle)}
              disabled={!selectedBundle || isPurchasing}
              className="w-full mt-4 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isPurchasing ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>Purchase {selectedBundle} Packs</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {/* Info Box */}
            <div className="mt-4 bg-[#EEF2FF] border border-[#5A5FF0]/30 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-[#5A5FF0] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#1A1D2E]">
                  <p className="font-semibold mb-1">How it works:</p>
                  <ul className="space-y-1 list-disc list-inside text-[#64748B]">
                    <li>Packs roll over across months</li>
                    <li>Valid for 6 months from purchase</li>
                    <li>Used after monthly quota</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Option */}
          <div className="px-6 py-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-[#94A3B8] font-semibold uppercase tracking-wide">Or</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1D2E]">Upgrade Your Plan</h3>
            </div>
            
            {/* Paper stack effect */}
            <div className="relative">
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#F59E0B]/25" />
              
              <div className="relative rounded-xl border-2 border-[#F59E0B]/40 bg-gradient-to-br from-white to-[#FFFBEB] p-4 shadow-sm">
                <p className="text-sm text-[#64748B] mb-3">
                  Get more packs every month with a subscription plan. Choose from Student Pro or Pro Plus.
                </p>
                <button 
                  onClick={() => setShowPaywallModal(true)}
                  className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <span>View Plans & Pricing</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#F8FAFB] border-t border-[#E2E8F0] flex-shrink-0">
            <p className="text-[#64748B] text-xs text-center">
              Secure payment powered by Stripe • Cancel anytime
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )

  return (
    <>
      {createPortal(modalContent, document.body)}
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        trigger="general"
      />
    </>
  )
}
