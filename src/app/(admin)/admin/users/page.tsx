import { getAdminUsersList } from '@/lib/actions/admin-users'
import { UserListTable } from '@/components/admin/users/UserListTable'
import { Users } from 'lucide-react'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const query = params.q || ''

    const { users, total } = await getAdminUsersList(page, query)

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">All Users</h1>
                        <p className="text-gray-400 text-sm">Manage and view all registered users</p>
                    </div>
                </div>

                {/* Table */}
                <UserListTable
                    users={users}
                    total={total}
                    formattedTotal={total} // Pass simple total for now
                    currentPage={page}
                />
            </div>
        </div>
    )
}
