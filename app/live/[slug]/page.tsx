import { notFound } from "next/navigation";
import LiveChat from "@/components/livechat/LiveChat";
import Expectations from "@/components/livechat/Expectations";
import { capitalizeName } from "@/lib/utils";
import Header from "@/components/livechat/Header";
import Footer from "@/components/landing/Footer";

const testSlugs = [
    "select-law-group",
    "the-other-law"
]

export default async function ClientPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    if (!testSlugs.includes(slug)) notFound()

    // Will be replaced with a FirmConfig when backend is live
    const firmName = capitalizeName(slug)

    return (
        <main className="marketing-bg min-h-screen">
            <Header />
            <div className="flex mx-auto justify-center pt-36 mb-24">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                    Welcome to {firmName}
                </h1>
            </div>
            <div className="flex flex-col mx-auto gap-y-10 md:grid md:grid-cols-[4fr_6fr] md:gap-x-8 px-10 max-w-7xl">
                <Expectations />
                <LiveChat firm={slug} />
            </div>
            <Footer />
        </main>
    )
}