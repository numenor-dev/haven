'use client';

import { authClient } from '@/lib/auth/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '../ui/spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { GoogleIcon } from '@/components/ui/button';


export default function SignInProviders() {

    const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);

    async function handleGoogleSignIn() {
        setLoadingProvider('google')

        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: '/dashboard',
                newUserCallbackURL: '/onboarding',
                errorCallbackURL: '/login',
            });
        } finally {
            setLoadingProvider(null)
        }
    }

    async function handleGitHubSignIn() {
        setLoadingProvider('github')

        try {
            await authClient.signIn.social({
                provider: 'github',
                callbackURL: '/dashboard',
                newUserCallbackURL: '/onboarding',
                errorCallbackURL: '/login',
            });
        } finally {
            setLoadingProvider(null);
        }
    }

    return (
        <div className="flex flex-col gap-y-3">
            <Button

                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                className="
                h-10 gap-2.5 bg-white hover:bg-zinc-50 dark:bg-slate-700 dark:hover:bg-slate-600/70
                text-zinc-800 dark:text-zinc-200 cursor-pointer
                "
                disabled={loadingProvider !== null}
            >
                {loadingProvider === 'google' ? <Spinner /> : <GoogleIcon />}
                <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">Continue with Google</span>
            </Button>
            <Button
                type="button"
                onClick={handleGitHubSignIn}
                className="h-10 gap-2.5 bg-zinc-900 hover:bg-zinc-900/90 dark:bg-black dark:hover:bg-black/50 cursor-pointer"
                disabled={loadingProvider !== null}
            >
                {loadingProvider === 'github' ? <Spinner /> : <FontAwesomeIcon icon={faGithub} />}
                <span className="text-sm font-medium">Continue with GitHub</span>
            </Button>
        </div>
    );
}