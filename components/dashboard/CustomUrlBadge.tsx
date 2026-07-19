'use client';
import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CustomUrlBadge({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center space-x-2 -ml-20 xl:ml-0">
            <p className="text-sm text-zinc-800 dark:text-zinc-300">
                Your custom URL:
                <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-sky-800 font-semibold">
                    {url}
                </Link>
            </p>

            <button
                onClick={handleCopy}
                aria-label="Copy client onboarding URL"
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mr-5"
            >
                {copied
                    ? <CheckIcon className="size-3.5 text-emerald-500" />
                    : <ClipboardIcon className="size-3.5 text-zinc-800 dark:text-zinc-300" />
                }
            </button>
        </div>
    );
}