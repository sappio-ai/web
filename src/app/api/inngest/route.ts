/**
 * Inngest API route for handling background jobs
 */

import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { processMaterial } from '@/lib/inngest/functions/process-material'
import { generatePack } from '@/lib/inngest/functions/generate-pack'
import { expirePlans } from '@/lib/inngest/functions/expire-plans'
import { expireExtraPacks } from '@/lib/inngest/functions/expire-extra-packs'
import {
  generateMoreFlashcards,
  generateMoreQuiz,
  generateMoreMindmap,
} from '@/lib/inngest/functions/generate-more-content'
import { sendDueReminders } from '@/lib/inngest/functions/send-due-reminders'
import { sendStreakAtRisk } from '@/lib/inngest/functions/send-streak-at-risk'
import { onboardingDrip } from '@/lib/inngest/functions/onboarding-drip'
import { checkLapsedUsers } from '@/lib/inngest/functions/check-lapsed-users'

// Force Node.js runtime (required for Buffer, native deps like pdf-parse)
export const runtime = 'nodejs'

// Register all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processMaterial,
    generatePack,
    expirePlans,
    expireExtraPacks,
    generateMoreFlashcards,
    generateMoreQuiz,
    generateMoreMindmap,
    sendDueReminders,
    sendStreakAtRisk,
    onboardingDrip,
    checkLapsedUsers,
  ],
})
