import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import {
    getFirmIdForUser,
    getFirmChatRecords,
    getChatRecordsById
} from '@/lib/dashboard';
import ClientListWrapper from '@/components/dashboard/ClientListWrapper';
import DataPanel from '@/components/dashboard/DataPanel';

export default async function DashboardPage({ searchParams }: {
    searchParams: Promise<{ chat?: string }>
}) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/login');

    const firmId = await getFirmIdForUser(session.user.id);
    if (!firmId) redirect('/onboarding');

    const { chat: selectedChatId } = await searchParams;
    const [chats, selectedRecord] = await Promise.all([
        getFirmChatRecords(firmId),
        selectedChatId ? getChatRecordsById(selectedChatId, firmId) : Promise.resolve(null),
    ]);

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <Suspense fallback={<ClientListSkeleton />}>
                <ClientListWrapper chats={chats} />
            </Suspense>
            <DataPanel record={selectedRecord} userName={session.user.name} />
        </div>
    );
}

function ClientListSkeleton() {
    return (
        <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="h-4 w-14 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="mt-1 size-2 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 animate-pulse" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-3.5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}