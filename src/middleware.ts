import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  if (!isProtected) {
    return NextResponse.next()
  }

  let token: string | undefined

  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  if (!token) {
    token = req.cookies.get('access_token')?.value
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const payload = verifyAccessToken(token)

    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
