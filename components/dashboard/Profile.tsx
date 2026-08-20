'use client';

import { useEffect, useActionState } from "react";
import { updateName, updateFirmName } from "@/app/dashboard/profile/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { ProfileProps } from "@/types/types";

const toastConfig = {
    duration: 3000,
    richColors: true
} as const;

export default function Profile({ currentName, currentFirm }: ProfileProps) {
    const [state, formAction, isPending] = useActionState(updateName, null);
    const [firmState, formFirmAction, isFirmPending] = useActionState(updateFirmName, null);

    useEffect(() => {
        if (!state) return
        if ('error' in state) toast.error(state.error, toastConfig)
        if ('success' in state) toast.success('Name updated!', toastConfig)
    }, [state])

    useEffect(() => {
        if (!firmState) return
        if ('error' in firmState) toast.error(firmState.error, toastConfig)
        if ('success' in firmState) toast.success('Firm updated!', toastConfig)
    }, [firmState])

    const inviteLink = 'https://gohaven.vercel.app/invite'

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
        toast.success('Copied to clipboard.')
    }

    return (
        <div className="flex flex-col max-w-4xl mx-auto px-7">
            <h1 className="text-2xl tracking-tighter font-semibold text-zinc-800 dark:text-zinc-300">
                Profile
            </h1>

            {/* Name */}
            <Card className="dark:bg-zinc-800/50 mt-2">
                <CardContent>
                    <form
                        noValidate
                        action={formAction}
                    >
                        <FieldGroup className="gap-5">
                            <p className="text-xl font-semibold tracking-tight my-2">Personal information</p>
                            <Field orientation="vertical">
                                <FieldLabel htmlFor="name" className="text-sm w-20">
                                    Name
                                </FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="h-9 w-full"
                                    autoComplete="name"
                                    defaultValue={currentName ?? ''}
                                />
                            </Field>
                        </FieldGroup>
                        <Button
                            disabled={isPending}
                            className="mt-4 h-10 text-sm p-4 font-medium cursor-pointer"
                        >
                            {isPending ? 'Saving…' : 'Update name'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Firm name */}
            <Card className="dark:bg-zinc-800/50 mt-3">
                <CardContent>
                    <form
                        noValidate
                        action={formFirmAction}
                    >
                        <FieldGroup className="gap-5">
                            <p className="text-xl font-semibold tracking-tight my-2">Firm name</p>
                            <Field orientation="vertical" className="gap-x-5">
                                <FieldLabel htmlFor="firm" className="text-sm w-32">
                                    New firm name
                                </FieldLabel>
                                <Input
                                    id="firm"
                                    name="firm"
                                    type="text"
                                    className="h-9 w-full"
                                    autoComplete="organization"
                                    defaultValue={currentFirm ?? ''}
                                />
                            </Field>
                        </FieldGroup>
                        <Button
                            disabled={isFirmPending}
                            className="mt-4 h-10 text-sm p-4 font-medium cursor-pointer"
                        >
                            {isFirmPending ? 'Saving…' : 'Update firm name'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Invite link */}
            <Card className="dark:bg-zinc-800/50 mt-3">
                <CardContent>
                     <p className="text-xl font-semibold tracking-tight my-2">Invite link</p>
                    <p className="text-sm mb-1">Send this link to an attorney within your firm to provide an easy sign-up process.</p>
                    <div className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-700 rounded-md px-3 h-9 max-w-sm">
                        <span className="text-sm truncate flex-1">{inviteLink}</span>
                        <DocumentDuplicateIcon
                            className="size-4 cursor-pointer shrink-0"
                            onClick={handleCopy}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}