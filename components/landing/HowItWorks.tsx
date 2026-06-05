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
            { threshold: 0.3 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect();
    }, [])

    return (
        <div
            ref={sectionRef}
            className="grid grid-cols-1 px-10 md:grid-cols-2 md:gap-x-10 gap-y-10 mt-20 max-w-6xl mx-auto">
            <p className="text-lg">
                Haven intelligently captures potential client
                needs to save your time and theirs. Haven will
                learn the practice area the client is reaching out for,
                such as workplace injury, bicycle accidents, or pedestrian injury
                and then asks contextually based questions for optimum clarity. Then,
                a PDF is generated and automatically emailed to the legal team.
            </p>
            <div>
                <DemoChat isActive={demoStarted} />
            </div>
        </div>
    )
}