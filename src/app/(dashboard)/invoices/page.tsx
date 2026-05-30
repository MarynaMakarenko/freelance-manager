'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, Trash2, Send, Eye } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge, { getStatusBadgeVariant } from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface InvoiceItem {
  amount: number
}

interface Invoice {
  id: string
  number: string
  status: string
  dueDate?: string | null
  sentAt?: string | null
  createdAt: string
  client?: { id: string; name: string } | null
  project?: { id: string; name: string } | null
  items: InvoiceItem[]
}

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => apiRequest<Invoice[]>(`/api/invoices${statusFilter ? `?status=${statusFilter}` : ''}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/invoices/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })

  const sendMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/invoices/${id}/send`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })

  const handleDelete = (invoice: Invoice) => {
    if (confirm(`Delete invoice #${invoice.number}?`)) {
      deleteMutation.mutate(invoice.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Invoices</h1>
          <p className="text-[15px] text-[#6E6E73] mt-1">{invoices.length} invoices</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus size={16} />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[13px] rounded-full border transition-colors ${
              statusFilter === s
                ? 'border-[#0066CC]/25 bg-[#0066CC]/10 text-[#0066CC] font-medium'
                : 'border-black/[0.08] bg-white text-[#6E6E73] hover:bg-[#F5F5F7]'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto mb-4 text-[#AEAEB2] opacity-30" />
          <p className="text-[16px] font-medium text-[#1D1D1F]">No invoices found</p>
          <p className="text-[14px] text-[#6E6E73] mt-1">Create your first invoice to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#FAFAFA]">
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Invoice</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Client</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Project</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider px-6 py-3">Due Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {invoices.map((invoice) => {
                const total = invoice.items.reduce((s, i) => s + i.amount, 0)
                return (
                  <tr key={invoice.id} className="hover:bg-[#F5F5F7] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-[#AEAEB2]" />
                        <span className="text-[14px] font-medium text-[#1D1D1F]">#{invoice.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#6E6E73]">
                      {invoice.client?.name || <span className="text-[#AEAEB2]">—</span>}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#6E6E73]">
                      {invoice.project?.name || <span className="text-[#AEAEB2]">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-[#1D1D1F]">${total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#6E6E73]">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : <span className="text-[#AEAEB2]">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <button className="p-1.5 text-[#AEAEB2] hover:text-[#0066CC] hover:bg-[#0066CC]/8 rounded-[8px] transition-colors">
                            <Eye size={14} />
                          </button>
                        </Link>
                        {invoice.status === 'DRAFT' && (
                          <button
                            onClick={() => sendMutation.mutate(invoice.id)}
                            disabled={sendMutation.isPending}
                            className="p-1.5 text-[#AEAEB2] hover:text-[#34C759] hover:bg-[#34C759]/8 rounded-[8px] transition-colors"
                            title="Send invoice"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="p-1.5 text-[#AEAEB2] hover:text-[#FF3B30] hover:bg-[#FF3B30]/8 rounded-[8px] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
