'use client';

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const steps = [
    {
        number: "01",
        title: "Sign up and claim your URL",
        body: "Enter your firm name during sign-up. Haven generates your unique client link, gohaven.com/live/your-firm, and adds it to your dashboard.",
    },
    {
        number: "02",
        title: "Try it yourself first",
        body: "One free, full onboarding session is included with every account. Use it to experience exactly what your clients will see before you share the link.",
    },
    {
        number: "03",
        title: "Send it to potential clients",
        body: "Share your URL by email or text before a consultation. Clients open it on any device with no account and no friction.",
    },
    {
        number: "04",
        title: "Review the case summary",
        body: "A structured summary and full chat transcript land in your dashboard the moment the session ends.",
    },
];

export default function HowItWorks() {
    const stepsRef = useRef<HTMLDivElement>(null);
    const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });

    return (
        <section className="py-28 px-8 md:px-5">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">

                    {/* Left: sticky section header */}
                    <div className="lg:sticky lg:top-28">
                        <p className="text-sky-600 dark:text-sky-400 text-xs font-semibold uppercase tracking-[0.18em] mb-4">
                            How it works
                        </p>
                        <h2 className="text-zinc-900 dark:text-zinc-50 text-4xl font-bold tracking-tight leading-tight mb-5">
                            From signup to your first case summary.
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">
                            Haven handles the client-facing workflow so attorneys can walk into every consultation already knowing the facts.
                        </p>
                    </div>

                    {/* Right: how to steps */}
                    <div ref={stepsRef}>
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 14 }}
                                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: i * 0.09, ease: "easeOut" }}
                                className="flex gap-5 pb-10 last:pb-0"
                            >
                                {/* Number circle and connector line */}
                                <div className="flex flex-col items-center">
                                    <div className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-800 flex items-center justify-center shrink-0">
                                        <span className="text-sky-600 dark:text-sky-400 text-xs font-bold tabular-nums">
                                            {step.number}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800 mt-3" />
                                    )}
                                </div>

                                {/* Step text */}
                                <div className="pt-1 min-w-0">
                                    <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                        {step.body}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-20 flex justify-center md:-ml-12"
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