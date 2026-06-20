'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { checkSlugAvailability } from './actions';

export function FirmNameField() {
    const [firmName, setFirmName] = useState('');
    const [status, setStatus] = useState<{ slug: string; available: boolean } | null>(null);
    const [isPending, startTransition] = useTransition();
    const latestInput = useRef('');

    useEffect(() => {
        latestInput.current = firmName;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!firmName.trim()) return setStatus(null);

        const timeout = setTimeout(() => {
            startTransition(async () => {
                const result = await checkSlugAvailability(firmName);
                if (latestInput.current === firmName) setStatus(result); // ignore stale responses
            });
        }, 400);
        return () => clearTimeout(timeout);
    }, [firmName]);

    return (
        <div>
            <input name="firmName" value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="Firm name" />
            {firmName && (
                <p className="text-sm">
                    {isPending ? 'Checking availability…' :
                        status?.available ? `✓ yourtool.com/live/${status.slug}` :
                            status ? `✗ ${status.slug} is taken — try a more specific name` : null}
                </p>
            )}
        </div>
    );
}