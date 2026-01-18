import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Star, Package, Calendar } from 'lucide-react'

async function getSuperUsers() {
    const supabase = await createClient()

    // Get users with their pack counts and last sign in
    // Super users = users with >= 3 packs
    const { data: users, error } = await supabase
        .from('users')
        .select(`
      id,
      email,
      full_name,
      plan,
      created_at,
      meta_json
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    // Get pack counts for each user
    const userIds = users?.map(u => u.id) || []

    const { data: packCounts, error: packError } = await supabase
        .from('study_packs')
        .select('user_id')
        .in('user_id', userIds)

    if (packError) {
        console.error('Error fetching pack counts:', packError)
    }

    // Count packs per user
    const packCountMap = new Map<string, number>()
    packCounts?.forEach(p => {
        packCountMap.set(p.user_id, (packCountMap.get(p.user_id) || 0) + 1)
    })

    // Filter to super users (>= 3 packs)
    const superUsers = users?.filter(u => (packCountMap.get(u.id) || 0) >= 3) || []

    return superUsers.map(u => ({
        ...u,
        pack_count: packCountMap.get(u.id) || 0
    }))
}

export default async function SuperUsersPage() {
    const superUsers = await getSuperUsers()

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Admin
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Super Users</h1>
                    <p className="text-gray-400">
                        Power users with 3+ study packs. Great candidates for testimonials & ambassadors.
                    </p>
                </div>

                {/* Stats */}
                <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-semibold">{superUsers.length}</span>
                        <span className="text-gray-400">super users found</span>
                    </div>
                </div>

                {/* Table */}
                {superUsers.length > 0 ? (
                    <div className="bg-[#1A1A24] border border-gray-800 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F0F14] border-b border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Plan</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Packs</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {superUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#252530] transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm text-white">{user.email}</p>
                                                {user.full_name && (
                                                    <p className="text-xs text-gray-400">{user.full_name}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${user.plan === 'pro_plus'
                                                    ? 'bg-purple-500/10 text-purple-400'
                                                    : user.plan === 'student_pro'
                                                        ? 'bg-blue-500/10 text-blue-400'
                                                        : 'bg-gray-500/10 text-gray-400'
                                                }`}>
                                                {user.plan === 'pro_plus' ? 'Pro Plus' : user.plan === 'student_pro' ? 'Student Pro' : 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-green-400" />
                                                <span className="text-sm text-white font-semibold">{user.pack_count}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-12 text-center">
                        <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No super users yet.</p>
                        <p className="text-gray-500 text-sm mt-1">Users with 3+ packs will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
