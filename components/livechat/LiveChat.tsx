
import { LiveSessionProps } from "@/types/types";
import { capitalizeName } from "@/lib/utils";

export default function LiveChat({ firm }: LiveSessionProps) {

    const firmName = firm ? capitalizeName(firm) : null;

    return (
        <div className="flex min-h-screen intake-bg">
            <span className="flex mx-auto mt-20 text-zinc-900">
                {firmName && <span>Welcome to {firmName}!</span>}
            </span>
        </div>
    )
}