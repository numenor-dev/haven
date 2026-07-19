'use client';

import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { DashboardHeaderProps } from "@/types/types";
import { ThemeToggle } from "@/components/ui/themetoggle";
import AccountMobile from "./AccountMobile";
import Link from "next/link";
import Account from "../dashboard/Account";
import CustomUrlBadge from "./CustomUrlBadge";
import TrialBadge from "./TrialBadge";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default function Header({ firmName, slug, trialStatus }: DashboardHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    const { scrollY } = useScroll();

    const backdropOpacity = useTransform(scrollY, [0, 10], [0, 0.9]);

    const customUrl = `${baseUrl}/live/${slug}`;

    const links = [
        { label: "Custom URL", href: `${customUrl}` },
    ]

    return (
        <>
            {/* Overlay closes menu on outside click */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-30 lg:hidden"
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            <motion.header
                className="fixed top-0 left-0 right-0 z-50"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                {/* Frosted glass background */}
                <motion.div
                    className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-zinc-300 dark:border-zinc-700/80"
                    style={{ opacity: backdropOpacity }}
                />

                {/* Main row */}
                <div className="relative mx-auto px-12 h-16 grid grid-cols-2 lg:grid-cols-3 items-center gap-x-2">

                    <Link href="/dashboard" className="flex items-center">
                        <span className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
                            {firmName}
                        </span>
                    </Link>

                    <div className="hidden lg:flex ml-[-10%]">
                        <CustomUrlBadge url={customUrl} />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <div className="hidden lg:flex items-center gap-5">
                            <TrialBadge isTrialExhausted={trialStatus} />
                            <Account />
                        </div>

                        {/* Hamburger button mobile only */}
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-nav"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {menuOpen ? (
                                    <motion.span
                                        key="close"
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 90 }}
                                        transition={{ duration: 0.15 }}
                                        className="block"
                                    >
                                        <XMarkIcon className="size-5 text-zinc-800 dark:text-zinc-200" />
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="open"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="block"
                                    >
                                        <Bars3Icon className="size-5 text-zinc-800 dark:text-zinc-200" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                         <ThemeToggle />
                    </div>
                </div>

                {/* Mobile dropdown */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            id="mobile-nav"
                            key="mobile-menu"
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="relative lg:hidden overflow-hidden"
                        >
                            {/* Dropdown background */}
                            <div className="absolute inset-0 bg-zinc-900/95 dark:bg-zinc-950/98 backdrop-blur-2xl" />

                            <div className="relative border-t border-white/10 px-4 pt-2 pb-5">

                                {/* Links */}
                                <nav className="flex flex-col gap-1">
                                    {links.map(({ href, label }, i) => (
                                        <motion.div
                                            key={href}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.06 + i * 0.05, duration: 0.2 }}
                                        >
                                            <Link
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={closeMenu}
                                                className="block text-sm font-medium px-3 py-3 rounded-lg text-zinc-200 hover:bg-white/10 transition-colors"
                                            >
                                                {label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </nav>

                                {/* Account section */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.06 + links.length * 0.05 + 0.04 }}
                                    className="mt-2 pt-3 border-t border-white/10"
                                >
                                    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                                        Account
                                    </p>
                                    <AccountMobile />
                                </motion.div>

                                {/* Trial status */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.06 + links.length * 0.05 + 0.08 }}
                                    className="mt-3 px-3"
                                >
                                    <TrialBadge isTrialExhausted={trialStatus} />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    );
}
