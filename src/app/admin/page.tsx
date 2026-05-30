'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Users, FolderKanban, FileText, Clock, AlertTriangle } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  isBlocked: boolean
  createdAt: string
  _count: {
    projects: number
    clients: number
    invoices: number
  }
}

interface AdminStats {
  totalUsers: number
  totalProjects: number
  totalClients: number
  totalInvoices: number
  totalTimeSessions: number
  features: Array<{ name: string; count: number }>
}

export default function AdminPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    // Verify admin role by trying to fetch admin stats
    apiRequest<AdminStats>('/api/admin/stats')
      .then(() => setAuthorized(true))
      .catch(() => router.push('/dashboard'))
  }, [router])

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiRequest<AdminUser[]>('/api/admin/users'),
    enabled: authorized,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiRequest<AdminStats>('/api/admin/stats'),
    enabled: authorized,
  })

  const blockMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/admin/users/${userId}/block`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#AF52DE] rounded-xl">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Admin Panel</h1>
            <p className="text-[15px] text-[#6E6E73] mt-0.5">Platform management and user administration</p>
          </div>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={<Users size={22} />} color="blue" />
            <StatsCard title="Total Projects" value={stats?.totalProjects || 0} icon={<FolderKanban size={22} />} color="green" />
            <StatsCard title="Total Invoices" value={stats?.totalInvoices || 0} icon={<FileText size={22} />} color="yellow" />
            <StatsCard title="Time Sessions" value={stats?.totalTimeSessions || 0} icon={<Clock size={22} />} color="purple" />
          </div>
        )}

        {/* Users table */}
        <div>
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">All Users</h2>
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.05] bg-[#FAFAFA]">
                    <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">User</th>
                    <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Role</th>
                    <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Projects</th>
                    <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Clients</th>
                    <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Invoices</th>
                    <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Joined</th>
                    <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-[#F5F5F7] transition-colors ${user.isBlocked ? 'bg-[#FF3B30]/4' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-[14px] font-medium text-[#1D1D1F]">{user.name}</p>
                          <p className="text-[12px] text-[#6E6E73]">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'ADMIN' ? 'purple' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[#6E6E73]">{user._count.projects}</td>
                      <td className="px-6 py-4 text-[14px] text-[#6E6E73]">{user._count.clients}</td>
                      <td className="px-6 py-4 text-[14px] text-[#6E6E73]">{user._count.invoices}</td>
                      <td className="px-6 py-4 text-[14px] text-[#6E6E73]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-[#FF3B30]" />
                            <span className="text-[14px] text-[#FF3B30] font-medium">Blocked</span>
                          </div>
                        ) : (
                          <span className="text-[14px] text-[#34C759] font-medium">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== 'ADMIN' && (
                          <Button
                            variant={user.isBlocked ? 'secondary' : 'danger'}
                            size="sm"
                            onClick={() => blockMutation.mutate(user.id)}
                            loading={blockMutation.isPending}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
