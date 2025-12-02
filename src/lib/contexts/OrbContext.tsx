'use client'

import { createContext, useContext } from 'react'
import type { OrbPose } from '@/components/orb/orb-poses'

interface OrbContextValue {
  getWelcomeOrb: () => OrbPose
  getPackCardOrb: (hasDueCards: boolean, isNew: boolean) => OrbPose
  getMotivationalMessage: () => { pose: OrbPose; message: string }
}

const motivationalMessages = [
  "You're crushing it! Keep going!",
  "Amazing progress! Stay consistent!",
  "You're on fire! Keep up the great work!",
  "Fantastic job! Your dedication shows!",
  "Outstanding! You're mastering this!",
]

// Get time-based welcome Orb
function getWelcomeOrb(): OrbPose {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'welcome-back-morning'
  } else if (hour >= 12 && hour < 18) {
    return 'welcome-back-afternoon'
  } else {
    return 'welcome-back-evening'
  }
}

// Get pack card Orb based on status
function getPackCardOrb(hasDueCards: boolean, isNew: boolean): OrbPose {
  if (isNew) {
    return 'neutral'
  }
  return hasDueCards ? 'pack-card-alert' : 'pack-card-happy'
}

// Get random motivational message
function getMotivationalMessage(): { pose: OrbPose; message: string } {
  const message =
    motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ]
  return {
    pose: 'motivational',
    message,
  }
}

const OrbContext = createContext<OrbContextValue>({
  getWelcomeOrb,
  getPackCardOrb,
  getMotivationalMessage,
})

export function OrbProvider({ children }: { children: React.ReactNode }) {
  return (
    <OrbContext.Provider
      value={{
        getWelcomeOrb,
        getPackCardOrb,
        getMotivationalMessage,
      }}
    >
      {children}
    </OrbContext.Provider>
  )
}

export function useOrb() {
  return useContext(OrbContext)
}
