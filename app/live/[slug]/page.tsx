import { notFound } from "next/navigation";
import { getFirmDataBySlug } from "@/lib/firm";
import { getFirmIdForUser } from "@/lib/dashboard";
import { auth } from "@/lib/auth/server";
import LiveChat from "@/components/livechat/LiveChat";
import ChatUnavailable from "@/components/livechat/ChatUnavailable";
import Expectations from "@/components/livechat/Expectations";
import Header from "@/components/livechat/Header";
import Footer from "@/components/landing/Footer";

const tempPhoneNumber = '555-555-5555';

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    if (!slug) notFound();

    const firm = await getFirmDataBySlug(slug);
    if (!firm) notFound();

    const { data: session } = await auth.getSession();
    
    let isOwner = false;
    if (session?.user?.id) {
        const userFirmId = await getFirmIdForUser(session.user.id);
        isOwner = userFirmId === firm.id;
    }

    const isLockedOut = firm.trialUsed && !firm.activeSubscription;

    return (
        <main className="marketing-bg min-h-screen">
            <Header />
            <div className="flex mx-auto justify-center pt-36 mb-24">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">
                    Welcome to {firm.firmName}
                </h1>
            </div>
            <div className="flex flex-col mx-auto gap-y-10 md:grid md:grid-cols-[5fr_5fr] md:gap-x-8 px-7 max-w-7xl">
                <Expectations />

                {isLockedOut ? (
                    <ChatUnavailable 
                        firmPhone={tempPhoneNumber}
                        isOwner={isOwner}
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