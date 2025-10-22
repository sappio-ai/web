/**
 * Inngest API route for handling background jobs
 */

import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { processMaterial } from '@/lib/inngest/functions/process-material'
import { generatePack } from '@/lib/inngest/functions/generate-pack'

// Register all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMaterial, generatePack],
})
