import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [totalUsers, totalProjects, totalClients, totalInvoices, totalTimeSessions] =
    await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.client.count(),
      prisma.invoice.count(),
      prisma.timeSession.count(),
    ])

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json({
    totalUsers,
    totalProjects,
    totalClients,
    totalInvoices,
    totalTimeSessions,
    recentUsers,
    features: [
      { name: 'Projects', count: totalProjects },
      { name: 'Clients', count: totalClients },
      { name: 'Invoices', count: totalInvoices },
      { name: 'Time Sessions', count: totalTimeSessions },
    ],
  })
}
