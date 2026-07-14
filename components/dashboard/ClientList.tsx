'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    ArrowLeftEndOnRectangleIcon,
    ArrowRightEndOnRectangleIcon
} from '@heroicons/react/24/solid';
import type { ChatRecordsListItem } from '@/types/types';

const statusConfig: Record<ChatRecordsListItem['status'], { dot: string; label: string }> = {
    new: { dot: 'bg-blue-500', label: 'New' },
    reviewed: { dot: 'bg-zinc-300 dark:bg-zinc-600', label: 'Reviewed' },
};

function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}

export default function ClientList({ chats }: { chats: ChatRecordsListItem[] }) {
    const [isOpen, setIsOpen] = useState(true);
    const searchParams = useSearchParams();
    const selectedId = searchParams.get('chat');

    return (
        <aside className={cn(
            'border-r border-zinc-300 dark:border-zinc-700/80 bg-zinc-200/30 dark:bg-zinc-950 flex flex-col overflow-hidden transition-all duration-200',
            isOpen ? 'w-80' : 'w-16'
        )}>
            {isOpen && (
                <>
                    {/* Header */}
                    <div className="px-4 pt-7 pb-3 shrink-0 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="mx-auto text-xs uppercase font-semibold text-zinc-900 dark:text-zinc-100">
                                Clients
                            </h2>
                            {chats.length > 0 && (
                                <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                                    {chats.length}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <nav className="flex-1 overflow-y-auto">
                        {chats.length === 0 ? (
                            <div className="px-4 py-10 text-center space-y-1">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">No clients yet.</p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                    Share your onboarding link with a client to get started.
                                </p>
                            </div>
                        ) : (
                            chats.map((chat) => {
                                const isSelected = chat.id === selectedId;
                                const { dot } = statusConfig[chat.status];
                                const displayName = chat.clientName ?? 'Unknown Client';
                                const isNew = chat.status === 'new';

                                return (
                                    <Link
                                        key={chat.id}
                                        href={`?chat=${chat.id}`}
                                        replace
                                        className={cn(
                                            'flex items-start gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 transition-colors duration-100',
                                            isSelected
                                                ? 'bg-zinc-100 dark:bg-zinc-800'
                                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                        )}
                                    >
                                        <div className="mt-1 shrink-0">
                                            <div className={cn('size-2 rounded-full', dot)} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn(
                                                'text-sm truncate',
                                                isNew
                                                    ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                                                    : 'font-medium text-zinc-600 dark:text-zinc-400'
                                            )}>
                                                {displayName}
                                            </p>
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                                                {formatDate(chat.createdAt)}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </nav>
                </>
            )}

            {/* Toggle */}
            <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className=
                    "flex h-12 w-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                    <div className="flex mx-auto gap-1 items-center">
                        {isOpen ? (
                            <>
                                <ArrowLeftEndOnRectangleIcon className="size-4 shrink-0" />
                                <span className={isOpen ? `text-sm` : `hidden`}>Hide menu</span>
                            </>
                        ) : (
                            <ArrowRightEndOnRectangleIcon className="size-4 shrink-0" />
                        )}
                    </div>
                </button>
            </div>
        </aside>
    );
}