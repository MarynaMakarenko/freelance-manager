import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [activeProjects, clientsCount, pendingInvoices, monthSessions] = await Promise.all([
    prisma.project.count({
      where: { userId: user.id, status: 'ACTIVE', isArchived: false },
    }),
    prisma.client.count({ where: { userId: user.id } }),
    prisma.invoice.findMany({
      where: { userId: user.id, status: { in: ['DRAFT', 'SENT'] } },
      include: { items: true },
    }),
    prisma.timeSession.findMany({
      where: {
        userId: user.id,
        startedAt: { gte: startOfMonth, lte: endOfMonth },
        endedAt: { not: null },
      },
      select: { duration: true },
    }),
  ])

  const expectedIncome = pendingInvoices.reduce((total, invoice) => {
    const invoiceTotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    return total + invoiceTotal
  }, 0)

  const hoursThisMonth = monthSessions.reduce((total, session) => {
    return total + (session.duration || 0)
  }, 0) / 3600

  const upcomingDeadlines = await prisma.project.findMany({
    where: {
      userId: user.id,
      deadline: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      isArchived: false,
    },
    include: { client: { select: { name: true } } },
    orderBy: { deadline: 'asc' },
  })

  return NextResponse.json({
    activeProjects,
    clientsCount,
    expectedIncome,
    hoursThisMonth: Math.round(hoursThisMonth * 10) / 10,
    upcomingDeadlines,
  })
}
