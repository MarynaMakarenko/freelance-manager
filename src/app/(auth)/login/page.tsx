'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Login failed'); return }
      localStorage.setItem('access_token', json.accessToken)
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-[64px] h-[64px] rounded-[18px] mb-5"
            style={{ background: 'linear-gradient(145deg, #1a80e0 0%, #0055AA 100%)', boxShadow: '0 4px 20px rgba(0,102,204,0.3)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">Sign In</h1>
          <p className="text-[15px] text-[#6E6E73] mt-1">Freelance Manager</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-[20px] border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <div className="p-3 bg-[#FF3B30]/8 rounded-[10px]">
                <p className="text-[13px] text-[#FF3B30]">{error}</p>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-[13px] text-[#6E6E73] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#0066CC] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
