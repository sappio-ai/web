import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { isAdmin } from '@/lib/auth/admin'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const adminStatus = await isAdmin()

    if (!adminStatus) {
        redirect('/')
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#0A0F1A]">
                {/* Admin Sidebar */}
                <AdminSidebar />

                {/* Main Content */}
                <div className="ml-64">
                    {children}
                </div>
            </div>
        </AuthGuard>
    )
}
