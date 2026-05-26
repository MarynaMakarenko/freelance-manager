import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const activeSession = await prisma.timeSession.findFirst({
    where: { userId: user.id, endedAt: null },
  })

  if (!activeSession) {
    return NextResponse.json({ error: 'No active timer session' }, { status: 400 })
  }

  const endedAt = new Date()
  const duration = Math.floor((endedAt.getTime() - activeSession.startedAt.getTime()) / 1000)

  const session = await prisma.timeSession.update({
    where: { id: activeSession.id },
    data: { endedAt, duration },
    include: {
      task: { include: { project: { select: { id: true, name: true } } } },
    },
  })

  return NextResponse.json(session)
}
