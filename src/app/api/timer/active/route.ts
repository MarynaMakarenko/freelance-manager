import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.timeSession.findFirst({
    where: { userId: user.id, endedAt: null },
    include: {
      task: {
        include: {
          project: { select: { id: true, name: true } },
        },
      },
    },
  })

  return NextResponse.json(session)
}
