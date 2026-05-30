'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download, Send, CheckCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge, { getStatusBadgeVariant } from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { apiRequest } from '@/lib/api'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Invoice {
  id: string
  number: string
  status: string
  dueDate?: string | null
  sentAt?: string | null
  notes?: string | null
  createdAt: string
  client?: {
    name: string
    company?: string | null
    email?: string | null
    phone?: string | null
  } | null
  project?: { name: string } | null
  items: InvoiceItem[]
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', params.id],
    queryFn: () => apiRequest<Invoice>(`/api/invoices/${params.id}`),
  })

  const sendMutation = useMutation({
    mutationFn: () => apiRequest(`/api/invoices/${params.id}/send`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice', params.id] }),
  })

  const paidMutation = useMutation({
    mutationFn: () => apiRequest(`/api/invoices/${params.id}`, { method: 'PUT', body: { status: 'PAID' } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice', params.id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/invoices/${params.id}`, { method: 'DELETE' }),
    onSuccess: () => router.push('/dashboard/invoices'),
  })

  const handleExportPdf = async () => {
    if (!invoice) return

    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    const total = invoice.items.reduce((s, i) => s + i.amount, 0)
    let y = 20

    doc.setFontSize(24)
    doc.setTextColor(30, 64, 175)
    doc.text('INVOICE', 20, y)

    doc.setFontSize(12)
    doc.setTextColor(100, 116, 139)
    doc.text(`#${invoice.number}`, 20, (y += 10))

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)

    if (invoice.client) {
      y += 15
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Bill To:', 20, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(invoice.client.name, 20, (y += 7))
      if (invoice.client.company) doc.text(invoice.client.company, 20, (y += 5))
      if (invoice.client.email) doc.text(invoice.client.email, 20, (y += 5))
    }

    if (invoice.dueDate) {
      doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 40)
    }
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 140, 47)

    y += 15

    // Table header
    doc.setFillColor(30, 64, 175)
    doc.setTextColor(255, 255, 255)
    doc.rect(20, y, 170, 8, 'F')
    doc.text('Description', 22, y + 5.5)
    doc.text('Qty', 115, y + 5.5)
    doc.text('Rate', 135, y + 5.5)
    doc.text('Amount', 160, y + 5.5)
    y += 8

    doc.setTextColor(0, 0, 0)
    invoice.items.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(20, y, 170, 7, 'F')
      }
      doc.text(item.description, 22, y + 5)
      doc.text(String(item.quantity), 115, y + 5)
      doc.text(`$${item.rate.toFixed(2)}`, 135, y + 5)
      doc.text(`$${item.amount.toFixed(2)}`, 160, y + 5)
      y += 7
    })

    y += 5
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: $${total.toFixed(2)}`, 140, y)

    if (invoice.notes) {
      y += 15
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      doc.text('Notes:', 20, y)
      doc.text(invoice.notes, 20, (y += 5))
    }

    doc.save(`invoice-${invoice.number}.pdf`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-[14px] text-[#6E6E73]">Invoice not found</p>
        <Link href="/dashboard/invoices" className="text-[#0066CC] hover:underline mt-2 inline-block">
          Back to Invoices
        </Link>
      </div>
    )
  }

  const total = invoice.items.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/invoices"
            className="p-2 rounded-[8px] text-[#AEAEB2] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Invoice #{invoice.number}</h1>
              <Badge variant={getStatusBadgeVariant(invoice.status)} size="md">
                {invoice.status}
              </Badge>
            </div>
            <p className="text-[15px] text-[#6E6E73] mt-1">Created {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download size={14} />
            Export PDF
          </Button>
          {invoice.status !== 'PAID' && (
            <>
              <Button variant="outline" size="sm" onClick={() => sendMutation.mutate()} loading={sendMutation.isPending}>
                <Send size={14} />
                Send
              </Button>
              <Button variant="secondary" size="sm" onClick={() => paidMutation.mutate()} loading={paidMutation.isPending}>
                <CheckCircle size={14} />
                Mark Paid
              </Button>
            </>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Delete this invoice?')) deleteMutation.mutate()
            }}
            loading={deleteMutation.isPending}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Invoice preview */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Invoice header */}
        <div className="bg-[#0066CC] px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">INVOICE</h2>
              <p className="text-white/70 mt-1">#{invoice.number}</p>
            </div>
            <div className="text-right text-white/80 text-[14px]">
              <p>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
              {invoice.dueDate && (
                <p className="mt-1">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              )}
              {invoice.project && (
                <p className="mt-1">Project: {invoice.project.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Client info */}
          {invoice.client && (
            <div className="mb-8">
              <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-2">Bill To</p>
              <p className="text-[14px] font-medium text-[#1D1D1F]">{invoice.client.name}</p>
              {invoice.client.company && <p className="text-[14px] text-[#6E6E73]">{invoice.client.company}</p>}
              {invoice.client.email && <p className="text-[14px] text-[#6E6E73]">{invoice.client.email}</p>}
              {invoice.client.phone && <p className="text-[14px] text-[#6E6E73]">{invoice.client.phone}</p>}
            </div>
          )}

          {/* Items table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-[#0066CC]">
                <th className="text-left text-[14px] font-semibold text-[#1D1D1F] pb-3">Description</th>
                <th className="text-center text-[14px] font-semibold text-[#1D1D1F] pb-3">Qty</th>
                <th className="text-right text-[14px] font-semibold text-[#1D1D1F] pb-3">Rate</th>
                <th className="text-right text-[14px] font-semibold text-[#1D1D1F] pb-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-[14px] text-[#1D1D1F]">{item.description}</td>
                  <td className="py-3 text-[14px] text-[#6E6E73] text-center">{item.quantity}</td>
                  <td className="py-3 text-[14px] text-[#6E6E73] text-right">${item.rate.toFixed(2)}</td>
                  <td className="py-3 text-[14px] font-medium text-[#1D1D1F] text-right">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#0066CC]">
                <td colSpan={3} className="pt-4 text-right font-bold text-[#1D1D1F]">Total</td>
                <td className="pt-4 text-right font-bold text-xl text-[#0066CC]">${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {invoice.notes && (
            <div className="bg-[#F5F5F7] rounded-xl p-4">
              <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-1">Notes</p>
              <p className="text-[14px] text-[#6E6E73]">{invoice.notes}</p>
            </div>
          )}

          {sendMutation.isSuccess && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-[#34C759]/10 rounded-[10px]">
              <p className="text-[13px] text-[#1a7a35]">{(sendMutation.data as { message?: string })?.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
