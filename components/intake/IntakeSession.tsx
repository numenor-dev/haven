'use client';

import { IntakeSessionProps } from "@/types/types";
import { capitalizeName } from "@/lib/utils";

export default function IntakeSession({
    firm,
    isDemo,
    isActive,
}: IntakeSessionProps) {

    const firmName = firm ? capitalizeName(firm) : null;

    return (
        <div className={`flex ${isDemo ? "h-150" : "min-h-screen"} intake-bg`}>
            <span className="flex mx-auto mt-20 text-zinc-900">
                {firmName && <span>Welcome to {firmName}!</span>}
            </span>
        </div>
    )
}