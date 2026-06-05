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

    return <LiveChat firm={slug} />
}