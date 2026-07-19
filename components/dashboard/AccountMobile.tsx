'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { authClient } from '@/lib/auth/client';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export default function AccountMobile() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const router = useRouter();

    const { data: session } = authClient.useSession();
    const userEmail = session?.user?.email ?? '';
    const userName = session?.user?.name ?? '';

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await authClient.signOut();
            router.push('/');
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/10"
            >
                <div className="min-w-0">
                    {userName && (
                        <p className="truncate text-sm font-medium text-zinc-200">
                            {userName}
                        </p>
                    )}
                    {userEmail && (
                        <p className="truncate text-xs text-zinc-400">
                            {userEmail}
                        </p>
                    )}
                </div>
                <ChevronDownIcon
                    className={`ml-2 size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-0.5 pb-1 pt-1 pl-3">
                            <Link
                                href="/dashboard/settings"
                                className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/10"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSigningOut ? 'Signing out…' : 'Sign out'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}