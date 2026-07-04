'use client';

import { motion, useScroll, useTransform } from "motion/react";
import { DashboardHeaderProps } from "@/types/types";
import { ThemeToggle } from "@/components/ui/themetoggle";
import Link from "next/link";
import Account from "../dashboard/Account";
import CustomUrlBadge from "./CustomUrlBadge";
import TrialBadge from "./TrialBadge";

export default function Header({ firmName, slug, trialStatus }: DashboardHeaderProps) {

    const { scrollY } = useScroll();

    const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);
    const backdropOpacity = useTransform(scrollY, [0, 10], [0, 0.9]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const customUrl = `${baseUrl}/live/${slug}`;

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Frosted glass background */}
            <motion.div
                className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl"
                style={{ opacity: backdropOpacity }}
            />

            {/* Scroll-reactive border */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px bg-zinc-200 dark:bg-zinc-700"
                style={{ opacity: borderOpacity }}
            />

            <div className="relative mx-auto px-12 h-16 grid grid-cols-3 items-center">
                <Link href="/dashboard" className="flex items-center">
                    <span className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
                        {firmName}
                    </span>
                </Link>
                <div className="hidden lg:flex justify-center">
                    <CustomUrlBadge url={customUrl} />
                </div>
                <div className="hidden lg:flex items-center gap-5 justify-end">
                    <TrialBadge isTrialExhausted={trialStatus} />
                    <Account />
                    <ThemeToggle />
                </div>
            </div>
        </motion.header>
    );
}