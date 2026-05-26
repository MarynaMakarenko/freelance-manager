import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const projectId = searchParams.get('projectId')

  const where: Record<string, unknown> = { userId: user.id }

  if (taskId) {
    where.taskId = taskId
  } else if (projectId) {
    where.task = { projectId }
  }

  const sessions = await prisma.timeSession.findMany({
    where,
    include: {
      task: {
        include: {
          project: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  })

  return NextResponse.json(sessions)
}
