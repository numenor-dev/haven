'use client';

import { motion } from "motion/react";
import Link from "next/link";

export default function Footer() {

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const links = [
        { label: "Home", href: "/", onClick: scrollToTop },
        { label: "How It Works", href: "./howitworks" },
        { label: "Blog", href: "./blog" },
    ];



    return (
        <div className="flex justify-center mt-24 border border-t-zinc-100/50 py-5">
            {links.map((link, index) => (
                <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.07, duration: 0.3 }}
                >
                    <Link
                        onClick={link.onClick}
                        href={link.href}
                        className="text-sm text-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/20 hover:dark:bg-sky-900 transition-all duration-200"
                    >
                        {link.label}
                    </Link>
                </motion.div>
            ))}
        </div>
    )
}