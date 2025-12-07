/**
 * EmailService
 * 
 * Handles sending emails via Resend
 */

import { Resend } from 'resend'
import { InviteEmail } from './templates/invite'

const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailService {
  /**
   * Send invite email to waitlist member with invite code
   */
  static async sendInviteEmail(email: string, inviteCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Sappio <hello@sappio.ai>',
        to: [email],
        subject: 'Your Sappio access code',
        react: InviteEmail({ email, inviteCode }),
        replyTo: 'hello@sappio.ai'
      })

      if (error) {
        console.error('[EmailService] Error sending invite:', error)
        return { success: false, error: error.message }
      }

      console.log(`[EmailService] Invite sent to ${email}:`, data?.id)
      return { success: true }
    } catch (error) {
      console.error('[EmailService] Failed to send invite:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Send invite emails to multiple recipients with their invite codes
   */
  static async sendBulkInvites(emailsWithCodes: Array<{ email: string; inviteCode: string }>): Promise<{
    successful: string[]
    failed: Array<{ email: string; error: string }>
  }> {
    const successful: string[] = []
    const failed: Array<{ email: string; error: string }> = []

    // Send emails sequentially to avoid rate limits
    for (const { email, inviteCode } of emailsWithCodes) {
      const result = await this.sendInviteEmail(email, inviteCode)
      
      if (result.success) {
        successful.push(email)
      } else {
        failed.push({ email, error: result.error || 'Unknown error' })
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return { successful, failed }
  }
}
