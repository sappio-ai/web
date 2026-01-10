'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { CallBackProps, Step } from 'react-joyride'

// Dynamically import Joyride with SSR disabled to prevent hydration mismatch
const Joyride = dynamic(() => import('react-joyride'), { ssr: false })

interface DashboardTourProps {
    run: boolean
    onFinish: () => void
    hasPacks: boolean
}

export default function DashboardTour({ run, onFinish, hasPacks }: DashboardTourProps) {
    const [isMounted, setIsMounted] = useState(false)

    // Only render Joyride after component mounts on client
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Different steps based on whether user has packs or not
    const stepsForNewUser: Step[] = [
        {
            target: 'body',
            placement: 'center',
            title: 'Welcome to your Dashboard!',
            content: 'This is your central hub for learning. Let me show you around quickly.',
            disableBeacon: true,
        },
        {
            target: '[data-tour="create-pack"]',
            content: 'Click here to turn your notes, PDFs, or slides into study packs. This is where the magic happens!',
            title: 'Create Your First Pack',
        },
    ]

    const stepsForExistingUser: Step[] = [
        {
            target: 'body',
            placement: 'center',
            title: 'Welcome to your Dashboard!',
            content: 'This is your central hub for learning. Let me show you around quickly.',
            disableBeacon: true,
        },
        {
            target: '[data-tour="create-pack"]',
            content: 'Click here to turn your notes, PDFs, or slides into study packs.',
            title: 'Create Magic',
        },
        {
            target: '[data-tour="stats-grid"]',
            content: 'Track your progress here. Watch your "Mastered" cards grow!',
            title: 'Your Progress',
        },
        {
            target: '[data-tour="recent-packs"]',
            content: 'Your study packs live here. Click any pack to start studying.',
            title: 'Your Library',
        }
    ]

    const steps = hasPacks ? stepsForExistingUser : stepsForNewUser

    const handleCallback = (data: CallBackProps) => {
        const { status } = data
        const finishedStatuses: string[] = ['finished', 'skipped']

        if (finishedStatuses.includes(status)) {
            onFinish()
        }
    }

    // Don't render anything until client-side mount
    if (!isMounted) return null

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            styles={{
                options: {
                    primaryColor: '#5A5FF0',
                    textColor: '#1A1D2E',
                    zIndex: 1000,
                },
                tooltip: {
                    borderRadius: '12px',
                    fontFamily: 'var(--font-inter)',
                },
                buttonNext: {
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '8px 16px',
                }
            }}
            callback={handleCallback}
        />
    )
}
