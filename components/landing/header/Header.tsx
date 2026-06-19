'use client';

import { motion, useScroll, useTransform } from "motion/react";
import { ThemeToggle } from "@/components/ui/themetoggle";
import Link from "next/link";

const links = [
    { label: "Features", href: "#features" },
    { label: "Scope", href: "#how-it-works" }
];

export default function Header() {
    const { scrollY } = useScroll();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Subtle border appears on scroll so the header separates from page content
    const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);
    const backdropOpacity = useTransform(scrollY, [0, 10], [0, 0.9]);

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <motion.div
                className="absolute inset-0 bg-sky-700/80 dark:bg-zinc-950 backdrop-blur-2xl"
                style={{ opacity: backdropOpacity }}
            />
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px bg-zinc-100/20"
                style={{ opacity: borderOpacity }}
            />

            <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center">
                <Link
                href="/"
                className="flex items-center"
                onClick={scrollToTop}
                >
                    <span className="text-lg font-semibold tracking-tight">
                        Haven
                    </span>
                </Link>

                {/* Nav links */}
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

                {/* CTA buttons on the right */}
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
            </div>
        </motion.header>
    );
}