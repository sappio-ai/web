/**
 * Inngest client for background job processing
 */

import { Inngest } from 'inngest'

// Create Inngest client
export const inngest = new Inngest({
  id: 'sappio-v2',
  name: 'Sappio V2',
})
