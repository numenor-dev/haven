'use client';

import { useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
    ArrowLeftIcon,
    ShieldCheckIcon,
    FunnelIcon,
    LockClosedIcon,
    BoltIcon,
    CircleStackIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const whyHaven = [
    {
        icon: ShieldCheckIcon,
        title: "Legal Safeguards",
        description:
            "Haven never offers legal advice and strict rules are enforced at every turn. Your firm is protected from Unauthorized Practice of Law claims while automating the onboarding process.",
    },
    {
        icon: FunnelIcon,
        title: "Automated Lead Triage",
        description:
            "Stop chasing unqualified inquiries. Haven collects critical case facts and contact information before a prospect ever reaches your inbox, so every consultation starts with context. A quantifiable, non-billable hour saver.",
    },
    {
        icon: LockClosedIcon,
        title: "Client Confidentiality",
        description:
            "Onboarding data is stored in an isolated, encrypted database specific to your firm. No shared infrastructure and conversation data is never used to train AI models.",
    },
];

const techChoices = [
    {
        icon: BoltIcon,
        title: "Next.js on Vercel",
        description:
            "Client onboarding sessions load instantly on any device with no app download required. Server-side rendering means your clients never wait for the page to become interactive.",
    },
    {
        icon: CircleStackIcon,
        title: "Neon PostgreSQL",
        description:
            "A fully managed, scalable database keeps your firm's onboarding records secure and available. Automatic backups and point-in-time restore mean your data is never at risk.",
    },
    {
        icon: ChatBubbleLeftRightIcon,
        title: "Anthropic Streaming API",
        description:
            "Estate planning conversations involve detailed responses. Streaming delivers the response in small, incremental pieces so the client never waits during the conversation.",
    },
];

function SectionHeader({
    title,
    body,
}: {
    title: string;
    body: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mb-12 px-3"
        >
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-5">
                {title}
            </h2>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {body}
            </p>
        </motion.div>
    );
}

function CardGrid({
    items,
}: {
    items: { icon: React.ElementType; title: string; description: string }[];
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
            {items.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                    className="flex flex-col gap-4 p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
                >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                        {title}
                    </h3>
                    <p className="grow text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {description}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

export default function Blog() {
    const containerRef = useRef(null);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen bg-zinc-200/70 dark:bg-zinc-950 overflow-hidden"
        >
           
            <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-24 pb-24">

                <SectionHeader
                    title="Why Choose Haven"
                    body="Your firm should spend time on clients, not paperwork. We automate onboarding while strictly adhering to legal advertising ethics."
                />
                <CardGrid items={whyHaven} />

                {/* Divider */}
                <div className="my-28" />

                <SectionHeader
                    title="Reasons Behind the Tech"
                    body="Every technology choice in Haven was made to serve a specific outcome for your firm: reliability, speed, and data security."
                />
                <CardGrid items={techChoices} />

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-16 flex justify-center"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        <ArrowLeftIcon className="size-4" />
                        Back to home
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}