'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePostHog } from 'posthog-js/react'
import Link from 'next/link'

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false)
    const [mounted, setMounted] = useState(false)
    const posthog = usePostHog()

    useEffect(() => {
        setMounted(true)
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent')
        if (!consent) {
            setShowBanner(true)
        } else if (consent === 'denied') {
            // If previously denied, opt out of PostHog
            posthog?.opt_out_capturing()
        }
    }, [posthog])

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted')
        posthog?.opt_in_capturing()
        setShowBanner(false)
    }

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'denied')
        posthog?.opt_out_capturing()
        setShowBanner(false)
    }

    if (!showBanner || !mounted) return null

    const bannerContent = (
        <div
            className="fixed bottom-0 left-0 right-0 p-4 sm:p-6"
            style={{ zIndex: 9990 }}
        >
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-[0_4px_24px_rgba(15,23,42,0.15),0_2px_8px_rgba(15,23,42,0.1)] border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-[15px] font-semibold text-[#1A1D2E] mb-1">
                            We use cookies 🍪
                        </h3>
                        <p className="text-[13px] text-gray-600 leading-relaxed">
                            We use analytics to understand how you use Sappio and improve your experience.{' '}
                            <Link href="/cookies" className="text-[#5A5FF0] hover:underline">
                                Learn more
                            </Link>
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleDecline}
                            className="flex-1 sm:flex-none px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:text-[#1A1D2E] hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 sm:flex-none px-4 py-2.5 text-[13px] font-medium text-white bg-[#5A5FF0] hover:bg-[#4A4FD0] rounded-lg transition-colors"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    // Use portal to render at document body level
    return createPortal(bannerContent, document.body)
}
