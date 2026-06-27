'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Account() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { data: session } = authClient.useSession();
    const userEmail = session?.user?.email ?? '';
    const userName = session?.user?.name ?? '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300"
            >
                <UserCircleIcon className="size-6" />
                <ChevronDownIcon
                    className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-zinc-100 py-1 z-50">
                    {/* User identity */}
                    <div className="px-4 py-2.5 border-b border-zinc-100">
                        {userName && (
                            <p className="text-sm font-medium text-zinc-800 truncate">{userName}</p>
                        )}
                        {userEmail && (
                            <p className="text-xs text-zinc-500 truncate mt-0.5">{userEmail}</p>
                        )}
                    </div>

                    {/* Nav links */}
                    <div className="py-1">
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors duration-200"
                        >
                            Profile
                        </Link>
                    </div>

                    {/* Async for clean sign out */}
                    <div className="border-t border-zinc-100 py-1">
                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSigningOut ? 'Signing out…' : 'Sign Out'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}