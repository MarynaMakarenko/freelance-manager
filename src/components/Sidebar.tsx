'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, FolderKanban, Timer,
  FileText, BarChart3, Settings, LogOut, Shield,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/timer', label: 'Time Tracker', icon: Timer },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

interface SidebarProps {
  userName: string
  userRole: string
}

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const token = localStorage.getItem('access_token')
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch {}
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  return (
    <div
      className="flex flex-col h-full bg-white flex-shrink-0 select-none"
      style={{ width: 240, borderRight: '1px solid rgba(0,0,0,0.07)' }}
    >
      {/* App name */}
      <div className="px-5 pt-6 pb-4">
        <span className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
          Freelance Manager
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto space-y-0.5">
        <p className="px-2 pt-2 pb-1 text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-widest">
          Workspace
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-colors text-[13.5px] font-medium ${
                isActive
                  ? 'bg-[rgba(0,102,204,0.09)] text-[#0066CC]'
                  : 'text-[#3D3D3F] hover:bg-black/[0.04] hover:text-[#1D1D1F]'
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </Link>
          )
        })}

        {userRole === 'ADMIN' && (
          <>
            <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-widest">
              Admin
            </p>
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-colors text-[13.5px] font-medium ${
                pathname.startsWith('/admin')
                  ? 'bg-[rgba(175,82,222,0.09)] text-[#AF52DE]'
                  : 'text-[#3D3D3F] hover:bg-black/[0.04] hover:text-[#1D1D1F]'
              }`}
            >
              <Shield size={16} strokeWidth={1.8} />
              Admin Panel
            </Link>
          </>
        )}

        <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-widest">
          Account
        </p>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-colors text-[13.5px] font-medium ${
            pathname === '/settings'
              ? 'bg-[rgba(0,102,204,0.09)] text-[#0066CC]'
              : 'text-[#3D3D3F] hover:bg-black/[0.04] hover:text-[#1D1D1F]'
          }`}
        >
          <Settings size={16} strokeWidth={1.8} />
          Settings
        </Link>
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-black/[0.04] transition-colors group">
          <div className="w-7 h-7 rounded-full bg-[#0066CC] flex items-center justify-center text-[12px] font-semibold text-white flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#1D1D1F] truncate leading-tight">{userName}</p>
            <p className="text-[11px] text-[#AEAEB2] capitalize leading-tight">{userRole.toLowerCase()}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#AEAEB2] hover:text-[#6E6E73] disabled:opacity-30"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
