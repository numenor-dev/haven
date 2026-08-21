import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/login');

    return (
        <div className="min-h-screen bg-zinc-200/50 dark:bg-zinc-950">
            <main className="pt-16 min-h-screen">
                {children}
            </main>
        </div>
    );
}