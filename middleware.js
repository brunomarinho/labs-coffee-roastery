import { NextResponse } from 'next/server'

export function middleware(request) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next()
    
    // Add security headers to prevent indexing
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    
    return response
  }
  
  // Protect admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}