'use server';

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { z } from 'zod';

const SignUpSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(30, { message: "Name cannot exceed 30 characters." }),
  email: z.email('Invalid email address'),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(64, { message: "Password cannot exceed 64 characters." })
    .refine((password) => /[A-Z]/.test(password), {
      message: "Password must contain at least one uppercase letter.",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "Password must contain at least one lowercase letter.",
    })
    .refine((password) => /[0-9]/.test(password), {
      message: "Password must contain at least one number.",
    })
    .refine((password) => /[!@#$%^&*?]/.test(password), {
      message: "Password must contain at least one special character.",
    }),
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
    return {
      error: result.error.issues[0].message
    };
  }

  const { name, email, password } = result.data;
  const { error } = await auth.signUp.email({ name, email, password });

  if (error?.status === 422) return { error: 'It looks like you may already have an account' }

  if (error) return { error: error.message || 'Failed to create account' };

  redirect('/onboarding');
}