'use client';

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ThemeToggle } from "@/components/ui/themetoggle";
import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

const links = [
    { label: "Features", href: "#features" },
    { label: "Road Map", href: "#roadmap" },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    const { scrollY } = useScroll();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Subtle border appears on scroll so the header separates from page content
    const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);
    const backdropOpacity = useTransform(scrollY, [0, 10], [0, 0.9]);

    return (
        <>
            {/* Overlay sits below the header */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-30 md:hidden"
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            <motion.header
                className="fixed top-0 left-0 right-0 z-40"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Scroll activated frosted glass backdrop */}
                <motion.div
                    className="absolute inset-0 bg-sky-700/80 dark:bg-zinc-950 backdrop-blur-2xl"
                    style={{ opacity: backdropOpacity }}
                />

                {/* Force solid backdrop on mobile when the menu is open */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            key="mobile-backdrop"
                            className="absolute inset-0 bg-sky-700/80 dark:bg-zinc-950 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        />
                    )}
                </AnimatePresence>

                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px bg-zinc-100/20"
                    style={{ opacity: borderOpacity }}
                />

                {/* Header row */}
                <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center">
                    <Link href="/" onClick={scrollToTop} className="flex items-center">
                        <span className="text-lg font-semibold tracking-tight">Haven</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        {links.map((link, index) => (
                            <motion.div
                                key={link.href}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.07, duration: 0.3 }}
                            >
                                <Link
                                    href={link.href}
                                    className="text-base text-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/20 hover:dark:bg-sky-900 transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-2 ml-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                        >
                            <Link
                                href="/login"
                                className="text-sm text-foreground px-3 py-2 rounded-lg bg-white/20 transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        </motion.div>
                        <ThemeToggle />
                    </div>

                    {/* Mobile nav */}
                    <div className="flex md:hidden items-center gap-1 ml-auto">
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
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
                                        <XMarkIcon className="size-6" />
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
                                        <Bars3Icon className="size-6" />
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
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="relative md:hidden overflow-hidden"
                        >
                            {/* Dropdown background */}
                            <div className="absolute inset-0 bg-sky-800/90 dark:bg-zinc-950/98 backdrop-blur-2xl" />

                            <div className="relative border-t border-white/10 px-4 pt-2 pb-5">
                                <nav className="flex flex-col gap-1">
                                    {links.map(({ href, label }, i) => (
                                        <motion.div
                                            key={href}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.06 + i * 0.05,
                                                duration: 0.2,
                                            }}
                                        >
                                            <Link
                                                href={href}
                                                onClick={closeMenu}
                                                className="block text-base font-medium px-3 py-3 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                {label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </nav>

                                {/* Sign In CTA */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.06 + links.length * 0.05 + 0.04 }}
                                    className="mt-3 pt-3 border-t border-white/10"
                                >
                                    <Link
                                        href="/login"
                                        onClick={closeMenu}
                                        className="block text-sm font-medium px-3 py-3 rounded-lg text-center bg-white/15 hover:bg-white/20 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    );
}