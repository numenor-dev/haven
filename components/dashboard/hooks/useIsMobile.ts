
'use client';

import { useState, useEffect } from 'react';

const mobileBreakpoint = 768;

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return isMobile;
}