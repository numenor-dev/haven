'use client';

import { useState, useRef, useEffect } from "react";
import DemoChat from "../demochat/DemoChat";

export default function HowItWorks() {

    const [demoStarted, setDemoStarted] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setDemoStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.7 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect();
    }, [])

    return (
        <div
            ref={sectionRef}
            className="flex flex-col max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-16">
            <div>
                <DemoChat isActive={demoStarted} />
            </div>
            <div className="mx-auto space-y-1 max-w-sm md:max-w-2xl">
                <h2 className="text-4xl font-semibold tracking-tight">Intake Automated</h2>
                <p>
                    Haven intelligently captures potential client
                    needs to save your time and theirs. Haven will
                    learn the practice area the client is reaching out for,
                    such as workplace injury, bicycle accidents, or pedestrian injury
                    and then asks contextually based questions for optimum clarity. Then,
                    a PDF is generated and automatically emailed to the legal team.
                </p>
            </div>
        </div>
    )
}