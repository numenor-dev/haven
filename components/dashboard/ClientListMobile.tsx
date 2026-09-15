'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
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

export default function ClientListMobile({ chats }: { chats: ChatRecordsListItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();
    const selectedId = searchParams.get('chat');

    // Scroll lock + Escape to close
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Open client conversation list"
                className="flex items-center justify-center"
            >
                <ChevronRightIcon className="size-5 text-zinc-800 dark:text-zinc-300 mx-3" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40"
                        />

                        {/* Drawer */}
                        <motion.div
                            key="drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl dark:bg-zinc-900"
                        >
                            {/* Drawer header */}
                            <div className="flex items-center justify-between px-4 pb-3 pt-6">
                                <div className="flex items-center gap-1.5">
                                    <h2 className="text-xs font-semibold uppercase text-zinc-900 dark:text-zinc-100">
                                        Clients
                                    </h2>
                                    {chats.length > 0 && (
                                        <span className="tabular-nums text-xs text-zinc-400 dark:text-zinc-500">
                                            {chats.length}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close client list"
                                    className="rounded-md p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    <ChevronLeftIcon className="size-5 text-zinc-600 dark:text-zinc-400" />
                                </button>
                            </div>

                            <div className="mx-3 h-px bg-zinc-100 dark:bg-zinc-800" />

                            {/* Client list */}
                            {chats.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center px-6 text-center">
                                    <p className="text-sm text-zinc-400 dark:text-zinc-500">
                                        No clients yet. Share your link to get started.
                                    </p>
                                </div>
                            ) : (
                                <ul className="flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800/60">
                                    {chats.map((chat) => {
                                        const isSelected = chat.id === selectedId;
                                        const { dot, label } = statusConfig[chat.status];

                                        return (
                                            <li key={chat.id}>
                                                <Link
                                                    href={`/dashboard?chat=${chat.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className={cn(
                                                        'flex items-start gap-3 px-4 py-3.5 transition-colors',
                                                        isSelected
                                                            ? 'bg-zinc-100 dark:bg-zinc-800'
                                                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'mt-1.5 size-2 shrink-0 rounded-full',
                                                            dot
                                                        )}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                            {chat.clientName ?? 'Unknown client'}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                                                            {formatDate(chat.createdAt)} · {label}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}