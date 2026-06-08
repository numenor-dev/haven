import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export default function Explainer() {
    const [inView, setInView] = useState<boolean>(false);
    const explainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },

            { threshold: 0.5 }
        )
        if (explainerRef.current) observer.observe(explainerRef.current)
        return () => observer.disconnect();
    }, [])

    return (
        <div
            ref={explainerRef}
            className="grid grid-cols-1 mx-auto space-y-10 px-7 max-w-7xl lg:grid-cols-[4fr_6fr] lg:space-x-12">
            <div>
                <motion.h2
                    className="text-4xl font-semibold tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 1, ease: "easeOut" }}>
                    Intake Automated
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}>
                    Haven intelligently captures potential client
                    needs to save your time and theirs. Haven will
                    learn the practice area the client is reaching out for,
                    such as workplace injury, bicycle accidents, or pedestrian injury
                    and then asks contextually based questions for optimum clarity. Then,
                    a PDF is generated and automatically emailed to the legal team.
                </motion.p>
            </div>
            <motion.div
                className="relative h-fit overflow-hidden rounded-xl border-b border-[#1c85c6] dark:border-[#234866]"
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <Image
                    src="/dashboard.png"
                    alt="Haven dashboard"
                    width={1000}
                    height={1000}
                    className="w-full object-top"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#1c85c6] dark:to-[#224664] pointer-events-none" />
            </motion.div>
        </div>
    )

}