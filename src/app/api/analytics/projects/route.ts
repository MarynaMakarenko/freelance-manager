import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await prisma.project.groupBy({
    by: ['status'],
    where: { userId: user.id },
    _count: { status: true },
  })

  const distribution = projects.map((p) => ({
    status: p.status,
    count: p._count.status,
  }))

  return NextResponse.json(distribution)
}
