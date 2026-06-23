'use client';

import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { GoogleIcon } from '@/components/ui/button';

type SignInProvidersProps = {
    callbackURL?: string;
}


export default function SignInProviders({ callbackURL = '/dashboard' }: SignInProvidersProps) {
    async function handleGoogleSignIn() {
        await authClient.signIn.social({
            provider: 'google',
            callbackURL,
            errorCallbackURL: '/login',
        });
    }

    async function handleGitHubSignIn() {
        await authClient.signIn.social({
            provider: 'github',
            callbackURL,
            errorCallbackURL: '/login',
        });
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
            >
                <GoogleIcon />
                <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">Continue with Google</span>
            </Button>
            <Button
                type="button"
                onClick={handleGitHubSignIn}
                className="h-10 gap-2.5 bg-zinc-900 hover:bg-zinc-900/90 dark:bg-black dark:hover:bg-black/50 cursor-pointer"
            >
                <FontAwesomeIcon icon={faGithub} />
                <span className="text-sm font-medium">Continue with GitHub</span>
            </Button>
        </div>
    );
}