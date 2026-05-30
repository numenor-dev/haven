import { capitalizeName } from "@/lib/utils";

export default function IntakeSession({ firm }: { firm: string }) {

    const firmName = capitalizeName(firm);

    return (
        <div className="flex min-h-screen intake-bg">
            <span className="flex mx-auto mt-20 text-zinc-900">
                Welcome to {firmName}!
            </span>
        </div>
    )
}