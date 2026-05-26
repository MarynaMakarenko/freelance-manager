import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'
import { z } from 'zod'

const startSchema = z.object({
  taskId: z.string(),
})

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = startSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
  }

  const { taskId } = parsed.data

  const task = await prisma.task.findFirst({
    where: { id: taskId },
    include: { project: { select: { userId: true } } },
  })

  if (!task || task.project.userId !== user.id) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Check if there's already an active session
  const activeSession = await prisma.timeSession.findFirst({
    where: { userId: user.id, endedAt: null },
  })

  if (activeSession) {
    return NextResponse.json({ error: 'A timer is already running. Stop it first.' }, { status: 400 })
  }

  const session = await prisma.timeSession.create({
    data: {
      taskId,
      userId: user.id,
      startedAt: new Date(),
    },
    include: {
      task: { include: { project: { select: { id: true, name: true } } } },
    },
  })

  return NextResponse.json(session, { status: 201 })
}
