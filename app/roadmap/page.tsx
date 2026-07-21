'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

type ItemStatus = 'shipped' | 'in_progress' | 'planned' | 'future';
type PhaseStatus = 'in_progress' | 'planned' | 'future';

type RoadmapItem = { label: string; status: ItemStatus };
type Phase = {
    id: string;
    label: string;
    name: string;
    status: PhaseStatus;
    description: string;
    items: RoadmapItem[];
};

const phases: Phase[] = [
    {
        id: 'v1',
        label: 'V1',
        name: 'Foundation',
        status: 'in_progress',
        description:
            'The core onboarding pipeline is everything a firm needs to enhance the onboarding process and reduce non-billable hours.',
        items: [
            { label: 'Conversational onboarding assistant', status: 'shipped' },
            { label: 'Real-time response streaming', status: 'shipped' },
            { label: 'Attorney dashboard with client records', status: 'shipped' },
            { label: 'Structured data extraction via tool use', status: 'shipped' },
            { label: 'Estate planning onboarding flow', status: 'shipped' },
            { label: 'Trial gating and session management', status: 'shipped' },
            { label: 'PDF generation and cloud storage', status: 'in_progress' },
            { label: 'Automated email delivery to attorney', status: 'in_progress' },
        ],
    },
    {
        id: 'v2',
        label: 'V2',
        name: 'Future Updates',
        status: 'future',
        description:
            'Deeper context, integrations with existing firm workflows, and richer per-firm customization.',
        items: [
            { label: 'RAG pipeline...', status: 'planned' },
            { label: 'Calendar integration...', status: 'planned' },
        ],
    }
];

const itemConfig: Record<ItemStatus, { dot: string; textClass: string; label: string }> = {
    shipped: { dot: 'bg-emerald-500', textClass: 'text-zinc-800 dark:text-zinc-200', label: 'Shipped' },
    in_progress: { dot: 'bg-amber-400', textClass: 'text-zinc-700 dark:text-zinc-400', label: 'In Progress' },
    planned: { dot: 'bg-zinc-300 dark:bg-zinc-600', textClass: 'text-zinc-500 dark:text-zinc-400', label: 'Planned' },
    future: { dot: 'bg-zinc-200 dark:bg-zinc-700', textClass: 'text-zinc-400 dark:text-zinc-500', label: 'Coming Soon' },
};

const phaseConfig: Record<PhaseStatus, { badge: string; dot: string; label: string }> = {
    in_progress: {
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        dot: 'bg-amber-400 border-amber-400',
        label: 'In Progress',
    },
    planned: {
        badge: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
        dot: 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950',
        label: 'Planned',
    },
    future: {
        badge: 'bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500',
        dot: 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950',
        label: 'Coming Soon',
    },
};

export default function RoadMap() {
    const timelineRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ['start center', 'end center'],
    });
    const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
            <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-24 pb-24">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-5">
                        Roadmap
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                        Haven is actively in development and priorities
                        shift as real attorney feedback shapes the product.
                    </p>
                </motion.div>

                {/* Legend */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="flex flex-wrap gap-x-6 gap-y-2 mb-16 pb-10 border-b border-zinc-200 dark:border-zinc-800"
                >
                    {(Object.entries(itemConfig) as [ItemStatus, typeof itemConfig[ItemStatus]][]).map(
                        ([status, { dot, label }]) => (
                            <div key={status} className="flex items-center gap-2">
                                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', dot)} />
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
                            </div>
                        )
                    )}
                </motion.div>

                {/* Timeline */}
                <div ref={timelineRef} className="relative">

                    <div className="absolute left-2.75 top-3 bottom-3 w-px bg-zinc-200 dark:bg-zinc-800" />

                    <motion.div
                        className="absolute left-2.75 top-3 w-px bg-sky-400 dark:bg-sky-600 origin-top"
                        style={{ height: spineHeight }}
                    />

                    <div className="space-y-16">
                        {phases.map((phase) => (
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.45, ease: 'easeOut' }}
                                className="relative pl-10"
                            >
                                <div className={cn(
                                    'absolute left-0 top-1.5 w-5.75 h-5.75 rounded-full border-2 z-10',
                                    phaseConfig[phase.status].dot,
                                )} />

                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                        {phase.label}
                                    </span>
                                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                        {phase.name}
                                    </h2>
                                    <span className={cn(
                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                        phaseConfig[phase.status].badge,
                                    )}>
                                        {phaseConfig[phase.status].label}
                                    </span>
                                </div>

                                <p className="text-sm text-zinc-500 dark:text-zinc-300 mb-6 leading-relaxed">
                                    {phase.description}
                                </p>

                                {/* Feature items */}
                                <div className="space-y-3">
                                    {phase.items.map((item, i) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -8 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: '-30px' }}
                                            transition={{ duration: 0.3, delay: i * 0.055, ease: 'easeOut' }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={cn(
                                                'w-2 h-2 rounded-full shrink-0',
                                                itemConfig[item.status].dot,
                                            )} />
                                            <span className={cn('text-sm', itemConfig[item.status].textClass)}>
                                                {item.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="mt-20 flex justify-center"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-sky-700 dark:hover:text-sky-100 transition-colors"
                    >
                        <ArrowLeftIcon className="size-4" />
                        Back to home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}