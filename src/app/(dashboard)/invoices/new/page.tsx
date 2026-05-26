'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import InvoiceForm from '@/components/InvoiceForm'
import { apiRequest } from '@/lib/api'

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

function buildInvoiceNumber(): string {
  const now = new Date()
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${rand}`
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [defaultNumber] = useState<string>(() => buildInvoiceNumber())

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiRequest<Client[]>('/api/clients'),
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiRequest<Project[]>('/api/projects'),
  })

  const createMutation = useMutation({
    mutationFn: (data: unknown) =>
      apiRequest<{ id: string }>('/api/invoices', { method: 'POST', body: data }),
    onSuccess: (invoice) => {
      router.push(`/dashboard/invoices/${invoice.id}`)
    },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/invoices"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
          <p className="text-slate-500 mt-1">Create a new invoice for your client</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <InvoiceForm
          defaultValues={{ number: defaultNumber }}
          clients={clients}
          projects={projects}
          onSubmit={async (data) => { await createMutation.mutateAsync(data) }}
          isLoading={createMutation.isPending}
          submitLabel="Create Invoice"
        />
        {createMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{createMutation.error?.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
