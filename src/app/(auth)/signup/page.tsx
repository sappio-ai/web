import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage() {
  const user = await getUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] px-4 py-12 sm:py-16">
      <SignupForm />
    </div>
  )
}
