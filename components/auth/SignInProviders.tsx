'use client';

import { authClient } from '@/lib/auth/client';
import { useState } from 'react';
import { toast } from 'sonner';

export function SignInButtons() {
  const [error, setError] = useState<string | null>(null);

  const signInWith = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/dashboard',
        newUserCallbackURL: '/onboarding',
        errorCallbackURL: '/error',
      });
    } catch {
      setError('Sign-in failed. Please try again.');
      toast.error(error);
    }
  };

  return (
    <div>
      <button onClick={() => signInWith('google')}>Continue with Google</button>
      <button onClick={() => signInWith('github')}>Continue with GitHub</button>
    </div>
  );
}