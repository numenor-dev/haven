import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getFirmIdForUser } from '@/lib/dashboard';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/login');

    const firmId = await getFirmIdForUser(session.user.id);
    if (!firmId) redirect('/onboarding');

    return <>{children}</>;
}