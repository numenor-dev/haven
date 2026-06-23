'use client';

import { cn } from "@/lib/utils";
import { useEffect, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signUpWithEmail } from "./actions";
import SignInProviders from "@/components/auth/SignInProviders";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";

export default function SignUpPage({ className }: React.ComponentProps<"div">) {
    const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state?.error]);

    return (
        <div className="bg-zinc-200 dark:bg-zinc-900 min-h-screen">
            <div className={cn("flex flex-col max-w-sm md:max-w-xl mt-24 mx-auto", className)}>
                <Card className="dark:bg-zinc-800/50">
                    <CardHeader>
                        <CardTitle className="text-xl mx-auto mt-5 md:text-2xl">
                            Create your account
                        </CardTitle>
                        <CardDescription className="md:text-base mx-auto">
                            Get started with Haven today
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction}>
                            <FieldGroup className="gap-8 max-w-xs md:max-w-lg mt-5 mx-auto">
                                <Field className="gap-1">
                                    <FieldLabel htmlFor="name" className="text-base">
                                        Name
                                    </FieldLabel>
                                    <Input
                                        name="name"
                                        id="name"
                                        type="text"
                                        placeholder="Jiminy Billy Bob"
                                        className="h-10"
                                        autoComplete="name"
                                        required
                                    />
                                </Field>
                                <Field className="gap-1">
                                    <FieldLabel htmlFor="email" className="text-base">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        name="email"
                                        id="email"
                                        type="email"
                                        placeholder="jbb@firm.com"
                                        className="h-10"
                                        autoComplete="email"
                                        required
                                    />
                                </Field>
                                <Field className="gap-1">
                                    <FieldLabel htmlFor="password" className="text-base">
                                        Password
                                    </FieldLabel>
                                    <Input
                                        name="password"
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-10"
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                    />
                                </Field>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        disabled={isPending}
                                        className="h-10 text-sm font-medium cursor-pointer"
                                    >
                                        {isPending ? 'Creating account…' : 'Create account'}
                                    </Button>

                                    <SignInProviders />

                                    <p className="text-sm text-center text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link href="/login" className="underline-offset-4 hover:underline">
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </FieldGroup>
                        </form>
                    </CardContent>
                    <Link href="/" className="flex w-40 mt-3 mx-auto items-center">
                        <div className="flex text-base space-x-1 mx-auto font-semibold tracking-tight">
                            <ArrowLongLeftIcon className="size-5 mt-0.5" />
                            <span className="text-zinc-700 dark:text-zinc-300">Go Back</span>
                        </div>
                    </Link>
                </Card>
            </div>
        </div>
    );
}