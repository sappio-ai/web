import crypto from 'crypto'

const SECRET = process.env.UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || 'sappio-unsubscribe-fallback'

/**
 * Generate a signed unsubscribe token for a user (stateless HMAC-based).
 * Token format: base64url(userId:signature)
 */
export function generateUnsubscribeToken(userId: string): string {
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(userId)
    .digest('hex')
  const payload = `${userId}:${signature}`
  return Buffer.from(payload).toString('base64url')
}

/**
 * Verify an unsubscribe token and return the userId if valid.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const payload = Buffer.from(token, 'base64url').toString('utf-8')
    const [userId, signature] = payload.split(':')
    if (!userId || !signature) return null

    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(userId)
      .digest('hex')

    if (signature !== expected) return null
    return userId
  } catch {
    return null
  }
}

/**
 * Build the full unsubscribe URL for a user.
 */
export function getUnsubscribeUrl(userId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const token = generateUnsubscribeToken(userId)
  return `${appUrl}/unsubscribe?token=${token}`
}
