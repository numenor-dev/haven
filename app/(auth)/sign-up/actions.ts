'use server';

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { z } from 'zod';

const SignUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const result = SignUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, password } = result.data;
  const { error } = await auth.signUp.email({ name, email, password });

  if (error) return { error: error.message || 'Failed to create account' };

  redirect('/onboarding');
}