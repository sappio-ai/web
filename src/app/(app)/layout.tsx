import { AuthGuard } from '@/components/auth/AuthGuard'
import Navbar from '@/components/layout/Navbar'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F8FAFC]">
                <Navbar />
                <main className="pt-16">
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}
