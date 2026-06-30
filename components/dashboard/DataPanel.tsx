import { DataPanelProps } from "@/types/types"


export default function DataPanel({ record, userName }: DataPanelProps) {

    if (!record) {
        return (
            <div className="flex flex-col flex-1 space-y-10 pt-5 bg-zinc-50 dark:bg-zinc-900">
                <h1 className="text-xl tracking-tigher font-semibold text-zinc-800 dark:text-zinc-300 mx-auto">Welcome {userName}</h1>
                <p className="text-zinc-800 dark:text-zinc-300 mx-auto">No client selected yet.</p>
            </div>

        )
    }

    console.log(record);
    
    return (
        <div className="flex flex-1 mt-5">
            <h1 className="text-black mx-auto">Welcome {userName}</h1>
        </div>
    )
}