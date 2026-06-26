// components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    InboxStackIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Intakes',
        href: '/dashboard',
        icon: InboxStackIcon,
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Cog6ToothIcon,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) =>
        href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-60 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col z-40">
            <nav className="flex-1 px-2 py-3 space-y-0.5">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                            isActive(href)
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                        )}
                    >
                        <Icon className="size-4.5 shrink-0" />
                        {label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}