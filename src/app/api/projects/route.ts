import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'
import { z } from 'zod'

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string().optional().nullable(),
  budget: z.number().optional().default(0),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
  deadline: z.string().optional().nullable(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const archived = searchParams.get('archived') === 'true'
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {
    userId: user.id,
    isArchived: archived,
  }

  if (clientId) where.clientId = clientId
  if (status) where.status = status
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, company: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 })
  }

  const { deadline, clientId, ...rest } = parsed.data

  if (clientId) {
    const client = await prisma.client.findFirst({ where: { id: clientId, userId: user.id } })
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const project = await prisma.project.create({
    data: {
      ...rest,
      clientId: clientId || null,
      deadline: deadline ? new Date(deadline) : null,
      userId: user.id,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
