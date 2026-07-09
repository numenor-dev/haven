import { ArrowLeftIcon } from "@heroicons/react/24/solid";


export default function TrialBadge({ isTrialExhausted }: { isTrialExhausted: boolean }) {
    if (!isTrialExhausted) {
        return (
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium
                             px-2.5 py-1 rounded-full
                             bg-emerald-50 text-emerald-700
                             dark:bg-emerald-950/50 dark:text-emerald-400
                             ring-1 ring-emerald-200 dark:ring-emerald-800">
                <ArrowLeftIcon className="size-3" />
                1 free live chat session with your custom URL
            </span>
        );
    }

    return (
        <span className="hidden lg:inline-flex items-center text-xs font-medium
                         px-2.5 py-1 rounded-full
                         bg-zinc-100 text-zinc-500
                         dark:bg-zinc-800 dark:text-zinc-400
                         ring-1 ring-zinc-200 dark:ring-zinc-700">
            Trial used
        </span>
    );
}