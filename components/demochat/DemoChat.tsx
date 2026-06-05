import { DemoSessionProps } from "@/types/types"

export default function DemoChat({ isActive }: DemoSessionProps) {

    if (!isActive) return null;

    return (
        <div className="min-h-screen">A test</div>
    )
}