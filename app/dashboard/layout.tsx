import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getFirmIdForUser } from '@/lib/dashboard';
import { getFirmNameForUser } from '@/lib/firm';
import Header from '@/components/dashboard/Header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/login');

    let firmId: string | null = null;
    try {
        firmId = await getFirmIdForUser(session.user.id);
    } catch {
        redirect('/onboarding');
    }

    if (!firmId) redirect('/onboarding');

    const firm = await getFirmNameForUser(firmId).catch(() => null);

    return (
        <div className="min-h-screen bg-zinc-200/50 dark:bg-zinc-950">
            <Header firmName={firm} />
            <main className="pt-16 min-h-screen">
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
}