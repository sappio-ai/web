import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const user = await getUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] px-4 py-12 sm:py-16">
      <LoginForm />
    </div>
  )
}
