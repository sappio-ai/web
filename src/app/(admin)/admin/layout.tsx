import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminStatus = await isAdmin()
  
  if (!adminStatus) {
    redirect('/')
  }
  
  return <>{children}</>
}
