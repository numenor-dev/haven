import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getFirmDataByUser } from '@/lib/firm';
import { FirmNotFoundError } from '@/lib/errors';
import Header from '@/components/dashboard/Header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/login');

    let firmData;
    try {
        firmData = await getFirmDataByUser(session.user.id);
    } catch (err) {
        if (err instanceof FirmNotFoundError) redirect('/onboarding');
        throw err;
    }

    return (
        <div className="min-h-screen bg-zinc-200/50 dark:bg-zinc-950">
            <Header
                firmName={firmData.firmName}
                slug={firmData.slug}
                trialStatus={firmData.trialUsed}
            />
            <main className="pt-16 min-h-screen">
                {children}
            </main>
        </div>
    );
}