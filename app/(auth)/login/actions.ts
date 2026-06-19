import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { authClient } from '@/lib/auth/client';


export async function signInWithEmail(
    _prevState: { error: string } | null,
    formData: FormData
) {
    const { error } = await auth.signIn.email({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    });
    if (error) {
        return { error: error.message || 'Failed to sign in. Try again' };
    }
    redirect('/');
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