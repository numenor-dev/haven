'use server';

import { auth } from "@/lib/auth/server";
import { authClient } from '@/lib/auth/client';
import { redirect } from "next/navigation";

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;
  if (!email) return { error: "Email address must be provided." };

  const { error } = await auth.signUp.email({
    email,
    name: formData.get('name') as string,
    password: formData.get('password') as string,
  });
  if (error) return { error: error.message || 'Failed to create account' };

  redirect('/onboarding');
}

export const handleGoogleSignIn = async () => {
  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      newUserCallbackURL: "/welcome",
      errorCallbackURL: "/error"
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};

export const handleGitHubSignIn = async () => {
  try {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      newUserCallbackURL: "/welcome",
      errorCallbackURL: "/error"
    })
  } catch (error) {
    console.error("Github sign-in error:", error);
  }
}