'use client';

import { cn } from "@/lib/utils";
import { useState, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signUpWithEmail } from "./actions";
import SignInProviders from "@/components/auth/SignInProviders";
import {
    Card,
    CardContent,
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

const toastConfig = {
    duration: 3000,
    richColors: true
} as const;

export default function SignUpPage({ className }: React.ComponentProps<"div">) {
    const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
    const [nameValue, setNameValue] = useState('');
    const [emailValue, setEmailValue] = useState('');

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error, toastConfig);
        }
    }, [state]);

    return (
        <div className="chat-bg min-h-screen pb-10">
            <div className={cn("flex flex-col max-w-sm md:max-w-xl mt-24 mx-auto", className)}>
                <Card className="dark:bg-zinc-800/50">
                    <CardHeader>
                        <CardTitle className="text-xl mx-auto mt-5 md:text-2xl tracking-tighter">
                            Create your account
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            noValidate
                            action={formAction}>
                            <FieldGroup className="gap-5 max-w-xs md:max-w-lg mt-5 mx-auto">
                                <Field className="gap-1">
                                    <FieldLabel htmlFor="name" className="text-sm ml-1">
                                        Name
                                    </FieldLabel>
                                    <Input
                                        onChange={(e) => setNameValue(e.target.value)}
                                        value={nameValue}
                                        placeholder="Enter your name"
                                        name="name"
                                        id="name"
                                        type="text"
                                        className="h-10"
                                        autoComplete="name"

                                    />
                                </Field>
                                <Field className="gap-1">
                                    <FieldLabel htmlFor="email" className="text-sm ml-1">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        onChange={(e) => setEmailValue(e.target.value)}
                                        value={emailValue}
                                        placeholder="Enter your email"
                                        name="email"
                                        id="email"
                                        type="email"
                                        className="h-10"
                                        autoComplete="email"
                                    />
                                </Field>
                                <Field className="gap-1">
                                    <FieldLabel htmlFor="password" className="text-sm">
                                        Password
                                    </FieldLabel>
                                    <Input
                                        placeholder="Create a password"
                                        name="password"
                                        id="password"
                                        type="password"
                                        className="h-10"
                                        autoComplete="new-password"
                                        minLength={8}
                                    />
                                    <p className="mt-1">
                                        Password must be a minimum of 8 characters and contain one
                                        uppercase letter, one number, and a special character.
                                    </p>
                                </Field>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        disabled={isPending}
                                        className="h-10 text-sm font-medium cursor-pointer"
                                    >
                                        {isPending ? 'Creating account…' : 'Create account'}
                                    </Button>

                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 border-t border-gray-300" />
                                        <span className="text-gray-500 text-sm">or</span>
                                        <div className="flex-1 border-t border-gray-300" />
                                    </div>

                                    <SignInProviders />

                                    <p className="mt-1 text-sm text-center text-muted-foreground">
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