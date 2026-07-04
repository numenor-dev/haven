'use client';

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useTransition, useActionState } from 'react';
import { checkSlugAvailability, createFirm } from "@/app/onboarding/actions";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function Onboarding({ className }: React.ComponentProps<"div">) {
    const [state, formAction, isSubmitting] = useActionState(createFirm, null);

    const [firmName, setFirmName] = useState('');
    const [slugStatus, setSlugStatus] = useState<{ slug: string; available: boolean } | null>(null);
    const [isChecking, startTransition] = useTransition();
    const latestInput = useRef('');

    useEffect(() => {
        latestInput.current = firmName;
        if (!firmName.trim()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSlugStatus(null);
        }

        const timeout = setTimeout(() => {
            startTransition(async () => {
                const result = await checkSlugAvailability(firmName);
                if (latestInput.current === firmName) setSlugStatus(result);
            });
        }, 400);
        return () => clearTimeout(timeout);
    }, [firmName]);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div>
            <div className={cn("flex flex-col max-w-sm md:max-w-xl mt-24 mx-auto", className)}>
                <Card className="dark:bg-zinc-800/50">
                    <CardHeader>
                        <CardTitle className="text-xl mx-auto mt-5 md:text-2xl">
                            Please set up your firm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} noValidate>
                            <FieldGroup className="gap-8 max-w-xs md:max-w-lg mt-5 mx-auto">
                                <Field className="gap-1">
                                    <FieldLabel htmlFor="firmName" className="text-base">
                                        Firm Name
                                    </FieldLabel>
                                    <Input
                                        name="firmName"
                                        id="firmName"
                                        type="text"
                                        placeholder="Smith & Associates"
                                        className="h-10"
                                        autoComplete="off"
                                        value={firmName}
                                        onChange={(e) => setFirmName(e.target.value)}
                                    />
                                    {firmName && (
                                        <p className={cn(
                                            "text-sm flex items-center gap-1.5 mt-1",
                                            isChecking && "text-muted-foreground",
                                            !isChecking && slugStatus?.available && "text-green-600 dark:text-green-400",
                                            !isChecking && slugStatus && !slugStatus.available && "text-red-500",
                                        )}>
                                            {isChecking ? 'Checking availability…' :
                                                slugStatus?.available ? (
                                                    <>
                                                        <CheckCircleIcon className="size-4 shrink-0" />
                                                        <span>Your custom URL is: gohaven.com/live/{slugStatus.slug}</span>
                                                    </>
                                                ) : slugStatus ? (
                                                    <>
                                                        <XCircleIcon className="size-4 shrink-0" />
                                                        <span>It looks like {slugStatus.slug} is taken. Please try a more specific name.</span>
                                                    </>
                                                ) : null}
                                        </p>
                                    )}
                                </Field>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isChecking || !slugStatus?.available}
                                    className="w-full h-10 text-sm font-medium cursor-pointer"
                                >
                                    {isSubmitting ? 'Creating your firm…' : 'Continue'}
                                </Button>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}