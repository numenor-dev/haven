import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';

// /live/[slug] is intentionally public so no auth required for client chat sessions

export default async function middleware(request: NextRequest) {

  // Auth is handled inside the actions so no need to run through proxy
  if (request.headers.has('next-action')) {
    return NextResponse.next();
  }
  return auth.middleware({ loginUrl: '/login' })(request);
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding'],
};