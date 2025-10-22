import { Tables } from './database'

export type UserProfile = Tables<'users'>

export type PlanTier = 'free' | 'student_pro' | 'pro_plus'

export type UserRole = 'user' | 'admin'

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: {
    id: string
    email: string
  }
}

export type PasswordResetToken = Tables<'password_reset_tokens'>
