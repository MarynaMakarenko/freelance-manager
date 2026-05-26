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
          <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('clientId')}
          >
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-slate-700">Line Items *</label>
          {errors.items && <span className="text-xs text-red-600">{errors.items.message}</span>}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <input
                  placeholder="Description"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register(`items.${index}.description`)}
                />
                {errors.items?.[index]?.description && (
                  <p className="text-xs text-red-600 mt-1">{errors.items[index]?.description?.message}</p>
                )}
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Qty"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
                  {...register(`items.${index}.amount`, { valueAsNumber: true })}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
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
      <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">Total</span>
        <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
