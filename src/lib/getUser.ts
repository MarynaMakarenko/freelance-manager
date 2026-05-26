import { NextRequest } from 'next/server'
import { verifyAccessToken } from './auth'
import { prisma } from './prisma'

export async function getUser(req: NextRequest) {
  try {
    let token: string | undefined

    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      const cookieToken = req.cookies.get('access_token')?.value
      token = cookieToken
    }

    if (!token) {
      return null
    }

    const payload = verifyAccessToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        currency: true,
        isBlocked: true,
      },
    })

    if (!user || user.isBlocked) {
      return null
    }

    return user
  } catch {
    return null
  }
}
