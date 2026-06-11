import { notFound } from "next/navigation";
import LiveChat from "@/components/livechat/LiveChat";

const testSlugs = [
    "select-law-group", "demo",
    "the-other-law", "demo"
]

export default async function CustomPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    if (!testSlugs.includes(slug)) notFound()

    return (
        <div className="w-full">
            <div className="flex flex-col max-w-lg px-7 sm:max-w-2xl md:max-w-3xl mx-auto">
                <LiveChat firm={slug} />
            </div>
        </div>
    )
}