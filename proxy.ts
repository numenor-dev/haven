import { auth } from '@/lib/auth/server';

// /live/[slug] is intentionally public so no auth required for client chat sessions

export default auth.middleware({
  loginUrl: '/login',
});

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding'],
};