import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'monthly'

  const now = new Date()
  let startDate: Date

  if (period === 'weekly') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (period === '90days') {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  } else {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: user.id,
      status: { in: ['SENT', 'PAID'] },
      createdAt: { gte: startDate },
    },
    include: {
      items: true,
      client: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by date
  const byDate: Record<string, number> = {}
  const byClient: Record<string, { name: string; total: number }> = {}

  invoices.forEach((invoice) => {
    const dateKey = invoice.createdAt.toISOString().split('T')[0]
    const invoiceTotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)

    byDate[dateKey] = (byDate[dateKey] || 0) + invoiceTotal

    if (invoice.client) {
      const clientKey = invoice.client.id
      if (!byClient[clientKey]) {
        byClient[clientKey] = { name: invoice.client.name, total: 0 }
      }
      byClient[clientKey].total += invoiceTotal
    }
  })

  const timeSeriesData = Object.entries(byDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const clientData = Object.values(byClient).sort((a, b) => b.total - a.total)

  return NextResponse.json({ timeSeriesData, clientData })
}
