import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const session = await prisma.timeSession.findFirst({ where: { id, userId: user.id } })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.timeSession.delete({ where: { id } })

  return NextResponse.json({ message: 'Session deleted' })
}
