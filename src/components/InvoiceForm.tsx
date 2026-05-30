'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import Input from './ui/Input'
import Button from './ui/Button'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number({ invalid_type_error: 'Enter a number' }).positive(),
  rate: z.number({ invalid_type_error: 'Enter a number' }).positive(),
  amount: z.number(),
})

const invoiceSchema = z.object({
  number: z.string().min(1, 'Invoice number required'),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item required'),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormData>
  clients: Client[]
  projects: Project[]
  onSubmit: (data: InvoiceFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export default function InvoiceForm({ defaultValues, clients, projects, onSubmit, isLoading, submitLabel = 'Create Invoice' }: InvoiceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: defaultValues || {
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')

  const handleRateOrQtyChange = (index: number) => {
    const qty = items[index]?.quantity || 0
    const rate = items[index]?.rate || 0
    setValue(`items.${index}.amount`, parseFloat((qty * rate).toFixed(2)))
  }

  const total = items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Invoice Number *"
          placeholder="INV-001"
          error={errors.number?.message}
          {...register('number')}
        />
        <Input
          label="Due Date"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Client</label>
          <select
            className="w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all"
            {...register('clientId')}
          >
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Project</label>
          <select
            className="w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all"
            {...register('projectId')}
          >
            <option value="">Select project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[13px] font-medium text-[#1D1D1F]">Line Items *</label>
          {errors.items && <span className="text-[12px] text-[#FF3B30]">{errors.items.message}</span>}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <input
                  placeholder="Description"
                  className="w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all"
                  {...register(`items.${index}.description`)}
                />
                {errors.items?.[index]?.description && (
                  <p className="text-[12px] text-[#FF3B30] mt-1">{errors.items[index]?.description?.message}</p>
                )}
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Qty"
                  className="w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    onChange: () => handleRateOrQtyChange(index),
                  })}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Rate"
                  className="w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all"
                  {...register(`items.${index}.rate`, {
                    valueAsNumber: true,
                    onChange: () => handleRateOrQtyChange(index),
                  })}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  readOnly
                  className="w-full bg-[#F5F5F7] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#AEAEB2] opacity-70"
                  {...register(`items.${index}.amount`, { valueAsNumber: true })}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="p-1.5 text-[#AEAEB2] hover:text-[#FF3B30] hover:bg-[#FF3B30]/8 rounded-[8px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}
        >
          <Plus size={14} />
          Add Item
        </Button>
      </div>

      {/* Total */}
      <div className="bg-[#F5F5F7] rounded-[10px] px-4 py-3 flex justify-between items-center">
        <span className="text-[13px] font-medium text-[#1D1D1F]">Total</span>
        <span className="text-xl font-bold text-[#0066CC]">${total.toFixed(2)}</span>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Notes</label>
        <textarea
          className="w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 transition-all resize-none"
          rows={3}
          placeholder="Payment terms, bank details, etc."
          {...register('notes')}
        />
      </div>

      <Button type="submit" loading={isLoading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
