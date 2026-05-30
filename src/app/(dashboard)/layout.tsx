'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  currency: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    apiRequest<UserInfo>('/api/profile')
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('access_token')
        router.push('/login')
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      <Sidebar userName={user.name} userRole={user.role} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[1200px] mx-auto">{children}</div>
      </main>
    </div>
  )
}
