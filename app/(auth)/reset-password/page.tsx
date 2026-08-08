'use client';

import { NeonAuthUIProvider, AuthView } from '@neondatabase/auth-ui';
import { authClient } from '@/lib/auth/client';

export default function ResetPassword() {
    return (
        <NeonAuthUIProvider
            basePath="/"
            baseURL={process.env.NEXT_PUBLIC_APP_URL}
            authClient={authClient}>
            <div className="chat-bg min-h-screen flex flex-col pt-32 px-5">
                <AuthView
                    className="mx-auto py-10 max-w-xl"
                    view="RESET_PASSWORD"
                    redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`}
                    classNames={{
                        footerLink: 'text-zinc-800 dark:text-zinc-100 hover:decoration-0'
                    }}
                />
            </div>
        </NeonAuthUIProvider>
    );
}