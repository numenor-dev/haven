import { notFound } from "next/navigation";
import { getFirmDataBySlug } from "@/lib/firm";
import { getFirmIdForUser } from "@/lib/dashboard";
import { auth } from "@/lib/auth/server";
import LiveChat from "@/components/livechat/LiveChat";
import ChatUnavailable from "@/components/livechat/ChatUnavailable";
import Header from "@/components/livechat/Header";
import Footer from "@/components/landing/Footer";

const tempPhoneNumber = '555-555-5555';

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    if (!slug) notFound();

    const firm = await getFirmDataBySlug(slug);
    if (!firm) notFound();

    const { data: session } = await auth.getSession();

    let isAttorney = false;
    if (session?.user?.id) {
        const userFirmId = await getFirmIdForUser(session.user.id);
        isAttorney = userFirmId === firm.id;
    }

    const isLockedOut = firm.trialUsed && !firm.activeSubscription;

    return (
        <main className="marketing-bg min-h-screen">
            <Header />
            <div className="flex justify-center mt-36 mb-16">
                <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight text-zinc-950 dark:text-sky-600/90">
                    Welcome to <i className="text-sky-100 dark:text-sky-100/90">{firm.firmName}</i>
                </h1>
            </div>
            <div className="flex flex-col mx-auto gap-y-10 md:gap-x-8 px-8">
                {isLockedOut ? (
                    <ChatUnavailable
                        firmPhone={tempPhoneNumber}
                        isOwner={isAttorney}
                        slug={slug}
                    />
                ) : (
                    <LiveChat slug={slug} firmName={firm.firmName} />
                )}

            </div>
            <Footer />
        </main>
    )
}