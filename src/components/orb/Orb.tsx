'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { orbPoses, type OrbPose } from './orb-poses'

interface OrbProps {
  pose: OrbPose
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animated?: boolean
  message?: string
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
}

export default function Orb({
  pose,
  size = 'md',
  className = '',
  animated = true,
  message,
}: OrbProps) {
  const poseData = orbPoses[pose]
  const dimensions = sizeMap[size]
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const shouldAnimate = animated && !prefersReducedMotion

  return (
    <div className={`orb-container ${className}`}>
      <div
        className={`orb-wrapper ${shouldAnimate ? 'orb-animated' : ''}`}
        role="img"
        aria-label={poseData.altText}
      >
        <Image
          src={poseData.imagePath}
          alt={poseData.altText}
          width={dimensions}
          height={dimensions}
          priority={poseData.preload}
          className="orb-image"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
      {message && (
        <p className="orb-message mt-4 text-center text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  )
}
