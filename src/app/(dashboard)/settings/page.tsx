'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

const currencies = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'SEK', label: 'SEK — Swedish Krona' },
  { value: 'NOK', label: 'NOK — Norwegian Krone' },
  { value: 'DKK', label: 'DKK — Danish Krone' },
  { value: 'PLN', label: 'PLN — Polish Zloty' },
  { value: 'UAH', label: 'UAH — Ukrainian Hryvnia' },
]

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currency: z.string(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  currency: string
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiRequest<UserProfile>('/api/profile'),
  })

  const {
    register: profileReg,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', currency: 'USD' },
  })

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name, currency: user.currency })
    }
  }, [user, resetProfile])

  const {
    register: passwordReg,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) })

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest('/api/profile', { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest('/api/profile', { method: 'PUT', body: data }),
    onSuccess: () => {
      resetPassword()
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Profile</h2>
        <p className="text-sm text-slate-500 mb-6">Update your name and currency</p>

        <form
          onSubmit={handleProfile(async (data) => {
            await updateProfileMutation.mutateAsync(data)
          })}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            placeholder="John Smith"
            error={profileErrors.name?.message}
            {...profileReg('name')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              {...profileReg('currency')}
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm text-green-700">Profile updated successfully</p>
            </div>
          )}

          {updateProfileMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{updateProfileMutation.error?.message}</p>
            </div>
          )}

          <Button type="submit" loading={profileSubmitting || updateProfileMutation.isPending}>
            Save Profile
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Change Password</h2>
        <p className="text-sm text-slate-500 mb-6">Ensure your account is using a strong password</p>

        <form
          onSubmit={handlePassword(async (data) => {
            await updatePasswordMutation.mutateAsync({
              currentPassword: data.currentPassword,
              newPassword: data.newPassword,
            })
          })}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.currentPassword?.message}
            {...passwordReg('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.newPassword?.message}
            {...passwordReg('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.confirmPassword?.message}
            {...passwordReg('confirmPassword')}
          />

          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm text-green-700">Password changed successfully</p>
            </div>
          )}

          {updatePasswordMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{updatePasswordMutation.error?.message}</p>
            </div>
          )}

          <Button type="submit" loading={passwordSubmitting || updatePasswordMutation.isPending}>
            Change Password
          </Button>
        </form>
      </Card>

      {/* Account info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Role</span>
            <span className="font-medium text-slate-900 capitalize">{user?.role?.toLowerCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">User ID</span>
            <span className="font-mono text-xs text-slate-600">{user?.id}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
