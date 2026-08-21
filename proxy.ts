import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';

export default async function proxy(request: NextRequest) {

  if (request.headers.has('next-action')) {
    return NextResponse.next();
  }
  return auth.middleware({ loginUrl: '/login' })(request);
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding'],
};