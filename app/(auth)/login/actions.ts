'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const SignInSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function signInWithEmail(
    _prevState: { error: string } | null,
    formData: FormData
) {
    const result = SignInSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password')
    });

    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const { email, password } = result.data;
    const { error } = await auth.signIn.email({ email, password });

    if (error) {
        return { error: error.message || 'There was an error signing in. Please try again' };
    }

    redirect('/dashboard');
}