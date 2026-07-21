'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const articles = [
    {
        title: "Zero Liability Risk",
        description: "Strict, pre-programmed guardrails ensure the assistant never provides legal advice, protecting your firm from Unauthorized Practice of Law (UPL) claims.",
        linkText: "Read about our safety protocols",
    },
    {
        title: "Automated Lead Triage",
        description: "Stop chasing unqualified inquiries. Haven collects critical case facts and contact information before the prospect ever reaches your inbox.",
        linkText: "See the onboarding workflow",
    },
    {
        title: "Attorney-Client Security",
        description: "Built with enterprise-grade encryption. Client intake data is isolated and never used to train external AI models, ensuring absolute confidentiality.",
        linkText: "View our privacy standards",
    }
];

export default function Blog() {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [40, -40]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={containerRef} className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">

                <motion.div
                    style={{ y: headerY, opacity: headerOpacity }}
                    className="max-w-3xl mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
                        Why Choose Haven
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Haven is designed with efficiency and safety at the core of your firm&apos;s workflow.
                        We automate the onboarding process while strictly adhering to legal advertising ethics.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {articles.map((article, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                            className="flex flex-col p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                        >
                            <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                                {article.title}
                            </h3>
                            <p className="grow text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {article.description}
                            </p>

                            <a
                                href="#"
                                className="inline-flex items-center mt-8 text-sm font-medium text-zinc-900 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 group"
                            >
                                {article.linkText}
                                <span className="ml-1 transition-transform group-hover:translate-x-1">
                                    &rarr;
                                </span>
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}