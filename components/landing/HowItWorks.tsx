'use client';

import { useState, useRef, useEffect } from "react";
import DemoChat from "../demochat/DemoChat";
import Explainer from "./Explainer";

export default function HowItWorks() {

    const [demoStarted, setDemoStarted] = useState(false)
    const chatRef = useRef<HTMLDivElement>(null)

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
        if (chatRef.current) observer.observe(chatRef.current)
        return () => observer.disconnect();
    }, [])

    return (
        <div className="space-y-28">
            <div
                ref={chatRef}
                className="flex flex-col max-w-lg px-7 sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
                <DemoChat isActive={demoStarted} />
            </div>
            <Explainer />
        </div>
    )
}