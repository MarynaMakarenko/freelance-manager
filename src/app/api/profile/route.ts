import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  currency: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, currency: true, createdAt: true },
  })

  return NextResponse.json(fullUser)
}

export async function PUT(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 })
  }

  const { name, currency, currentPassword, newPassword } = parsed.data

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (currency) updateData.currency = currency

  if (currentPassword && newPassword) {
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const passwordMatch = await bcrypt.compare(currentPassword, fullUser.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    updateData.password = await bcrypt.hash(newPassword, 12)
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, currency: true },
  })

  return NextResponse.json(updated)
}
