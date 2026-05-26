import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAccessToken, verifyRefreshToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    const payload = verifyRefreshToken(refreshToken)

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    }

    if (storedToken.user.isBlocked) {
      return NextResponse.json({ error: 'Account is blocked' }, { status: 403 })
    }

    const accessToken = generateAccessToken(payload.userId, storedToken.user.role)

    return NextResponse.json({ accessToken })
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
