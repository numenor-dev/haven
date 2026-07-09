'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useSmoothChat(onDrained?: () => void) {
    const queue = useRef<string[]>([]);
    const textRef = useRef<HTMLSpanElement>(null);
    const rawText = useRef('');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = useRef(true);


    const onDrainedRef = useRef(onDrained);
    useEffect(() => { onDrainedRef.current = onDrained; });

    const drain = useCallback(() => {
        if (!isMounted.current) return;

        if (!queue.current.length) {
            timerRef.current = null;
            onDrainedRef.current?.();
            return;
        }

        const qLen = queue.current.length;
        let charsToPop: number;
        let delay: number;

        if (qLen > 100) { charsToPop = 4; delay = 5; }
        else if (qLen > 50) { charsToPop = 2; delay = 10; }
        else if (qLen > 20) { charsToPop = 1; delay = 15; }
        else { charsToPop = 1; delay = 20; }

        rawText.current += queue.current.splice(0, charsToPop).join('');

        if (textRef.current) {
            textRef.current.textContent = rawText.current;
        }

        // eslint-disable-next-line react-hooks/immutability
        timerRef.current = setTimeout(drain, delay);
    }, []);

    const enqueue = useCallback((chunk: string) => {
        for (const char of chunk) {
            queue.current.push(char);
        }

        if (!timerRef.current) {
            drain();
        }
    }, [drain]);

    /** Call before each new assistant turn to clear accumulated state. */
    const reset = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        queue.current = [];
        rawText.current = '';
        if (textRef.current) {
            textRef.current.textContent = '';
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    return { textRef, enqueue, reset };
}