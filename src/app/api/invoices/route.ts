import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'
import { z } from 'zod'

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  rate: z.number().positive(),
  amount: z.number(),
})

const invoiceSchema = z.object({
  clientId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  number: z.string().min(1),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']).optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
})

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('clientId')

  const where: Record<string, unknown> = { userId: user.id }
  if (status) where.status = status
  if (clientId) where.clientId = clientId

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = invoiceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 })
  }

  const { items, dueDate, ...rest } = parsed.data

  const invoice = await prisma.invoice.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: user.id,
      items: {
        create: items,
      },
    },
    include: { items: true, client: true, project: true },
  })

  return NextResponse.json(invoice, { status: 201 })
}
