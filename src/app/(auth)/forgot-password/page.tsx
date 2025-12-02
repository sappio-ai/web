import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  const user = await getUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1A] px-4 py-12 sm:py-16">
      <ForgotPasswordForm />
    </div>
  )
}
