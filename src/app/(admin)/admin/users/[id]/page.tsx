import { getAdminUserDetails } from '@/lib/actions/admin-users'
import { UserDetailHeader, UserActivityTimeline } from '@/components/admin/users/UserDetailComponents'
import { notFound } from 'next/navigation'

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getAdminUserDetails(id)

    if (!user) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <UserDetailHeader user={user} />
                <UserActivityTimeline activity={user.activity} />
            </div>
        </div>
    )
}
