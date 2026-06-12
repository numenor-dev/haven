'use client';

import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useState } from "react";
import { Button } from "@/components/ui/button"
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


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [emailValue, setEmailValue] = useState(email ?? '');

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mx-auto">Login to your account</CardTitle>
          <CardDescription className="text-base mx-auto">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup className="gap-8">
              <Field className="gap-1">
                <FieldLabel htmlFor="email" className="text-base">
                  Email
                </FieldLabel>
                <Input
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  id="email"
                  type="email"
                  placeholder="haven@example.com"
                  className="h-10"
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
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-9"
                  required
                />
              </Field>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full h-9 text-base hover:bg-sky-600 cursor-pointer"
                >
                  Login
                </Button>
                <Button
                  type="button"
                  className="w-full h-9 text-base text-zinc-700 bg-slate-300 hover:bg-slate-300/70 cursor-pointer"
                >
                  Login with Google
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Don&apos;t have an account? <a href="/signup">Sign up</a>
                </p>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div>
        <Link
          href="/"
          className="flex items-center"
        >
          <div className="flex text-base space-x-1 mx-auto text-zinc-700 font-semibold tracking-tight">
            <ArrowLongLeftIcon className="size-5 mt-0.5" />
            <p>Go Back</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
