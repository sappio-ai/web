import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getUser } from '@/lib/auth/session'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Sappio account and start transforming your study materials into AI-powered flashcards, quizzes, and mind maps.",
  openGraph: {
    title: "Create Your Sappio Account",
    description: "Start transforming your study materials into AI-powered flashcards, quizzes, and mind maps.",
    url: "https://sappio.ai/signup",
  }
}

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
