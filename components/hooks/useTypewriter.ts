import { useState, useEffect, useRef } from "react";

export function useTypewriter(fullText: string, charsPerMs: number = 0.08) {
    const [displayed, setDisplayed] = useState('');
    const indexRef = useRef(0);
    const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() =>{
        if (fullText.length <= indexRef.current) return;

        const tick = () => {
            indexRef.current += 1;
            setDisplayed(fullText.slice(0, indexRef.current));

            if (indexRef.current < fullText.length) {
                frameRef.current = setTimeout(tick, 1000 / (charsPerMs * 1000));
            }
        };

        frameRef.current = setTimeout(tick, 1000 / (charsPerMs * 1000));

        return () => {
            if (frameRef.current) clearTimeout(frameRef.current);
        };
    }, [fullText, charsPerMs]);

    // Content clears when new message starts
    useEffect(() => {
        if (fullText === "") {
            indexRef.current = 0;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisplayed("");
        }
    }, [fullText]);

    return displayed;
}