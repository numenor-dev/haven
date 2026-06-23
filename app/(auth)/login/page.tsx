'use client';

import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useActionState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signInWithEmail } from "./actions";
import SignInProviders from "@/components/auth/SignInProviders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid"

function EmailPrefill({ onEmail }: { onEmail: (v: string) => void }) {
  const searchparams = useSearchParams();
  const email = searchparams.get('email');
  useEffect(() => { if (email) onEmail(email); }, [email, onEmail]);
  return null;
}

export default function LoginPage({ className }: React.ComponentProps<"div">) {

  const [state, formAction, isPending] = useActionState(signInWithEmail, null);
  const [emailValue, setEmailValue] = useState('');

  useEffect(() => {
    if (state?.error) {
      toast.error('Invalid email or password');
    }
  }, [state?.error])

  return (
    <div className="bg-zinc-200 dark:bg-zinc-900 min-h-screen">
      <div className={cn("flex flex-col max-w-sm md:max-w-xl mt-24 mx-auto", className)}>
        <Card className="dark:bg-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-xl mx-auto mt-5 md:text-2xl">Login to your account</CardTitle>
            <CardDescription className="md:text-base mx-auto">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <Suspense fallback={null}>
                <EmailPrefill onEmail={setEmailValue} />
              </Suspense>
              <FieldGroup className="gap-8 max-w-xs md:max-w-lg mt-5 mx-auto">
                <Field className="gap-1">
                  <FieldLabel htmlFor="email" className="text-base">
                    Email
                  </FieldLabel>
                  <Input
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    name="email"
                    id="email"
                    type="email"
                    placeholder="haven@example.com"
                    className="h-10"
                    autoComplete="email"
                    required

                  />
                </Field>
                <Field className="gap-1">
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password" className="text-base">
                      Password
                    </FieldLabel>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    name="password"
                    id="password"
                    type="password"
                    className="h-10"
                    autoComplete="current-password"
                    required

                  />
                </Field>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-10 text-sm font-medium hover:bg-sky-700 cursor-pointer"
                  >
                    Login
                  </Button>

                  <SignInProviders />

                  <p className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
                  </p>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
          <Link
            href="/"
            className="flex w-40 mt-3 mx-auto items-center"
          >
            <div className="flex text-base space-x-1 mx-auto font-semibold tracking-tight">
              <ArrowLongLeftIcon className="size-5 mt-0.5" />
              <span className="text-zinc-700 dark:text-zinc-300">Go Back</span>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  )
}