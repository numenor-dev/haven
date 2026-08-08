'use client';

import { useState } from 'react';
import { NeonAuthUIProvider, AuthView } from '@neondatabase/auth-ui';
import { authClient } from '@/lib/auth/client';
import { toast } from 'sonner';

const toastConfig = {
    duration: 3000,
    richColors: true
} as const;

export default function ForgotPassword() {
    const [emailSent, setEmailSent] = useState(false);

    if (emailSent) {
        return (
            <div className="chat-bg min-h-screen flex flex-col items-center pt-32">
                <p>If an account exists for that email, you&apos;ll receive a reset link shortly.</p>
            </div>
        );
    }

    return (
        <NeonAuthUIProvider
            toast={({ variant, message }) => {
                if (variant === 'success') toast.success('Success!', toastConfig);
                if (variant === 'error') toast.error(message, toastConfig);
            }}
            authClient={authClient}
            basePath="/"
            navigate={(href) => {
                if (href.includes('sign-in')) {
                    setEmailSent(true);
                } else {
                    window.location.href = href;
                }
            }}
        >
            <div className="chat-bg min-h-screen flex flex-col pt-32 px-5">
                <AuthView
                    className="mx-auto py-10 max-w-xl"
                    view="FORGOT_PASSWORD"
                    classNames={{
                        footerLink: 'text-zinc-800 dark:text-zinc-100 hover:decoration-0'
                    }}
                />
            </div>
        </NeonAuthUIProvider>
    );
}