'use server';

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!name) return { error: 'Name must be provided.'}
  if (!email) return { error: "Email must be provided." };

  const { error } = await auth.signUp.email({
    email,
    name: formData.get('name') as string,
    password: formData.get('password') as string,
  });
  if (error) return { error: error.message || 'Failed to create account' };

  redirect('/onboarding');
}