'use client';

import {
    useCallback,
    useEffect,
    useState,
    useRef
} from "react";
import {
    Message,
    SessionStatus,
    LiveSessionProps,
    LiveSessionReturn
} from "@/types/types";
import { useStream } from "../../hooks/useStream";


export default function useLiveSession({ slug, clientName }: LiveSessionProps): LiveSessionReturn {
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const hasStarted = useRef(false);

    const appendToLastMessage = useCallback((text: string) => {
        setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
                ...last,
                content: last.content + text,
            };
            return updated;
        });
    }, []);

    const onComplete = useCallback(() => {
        setStatus('user_turn');
        setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
                updated[updated.length - 1] = {
                    ...last,
                    timestamp: new Date().toISOString(),
                };
            }
            return updated;
        });
    }, []);
    const onSessionComplete = useCallback(() => setStatus('complete'), []);
    const onError = useCallback((error: Error) => {
        console.error('[useLiveSession] Stream error:', error);
        setError(error);
        setStatus('error');
    }, []);

    const { startStream, cancelStream } = useStream({
        onChunk: appendToLastMessage,
        onComplete,
        onError,
        onSessionComplete
    });

    const cancel = useCallback(() => {
        cancelStream();
        if (status === 'streaming') setStatus('user_turn');
    }, [cancelStream, status]);

    const start = useCallback(async () => {
        setStatus('streaming');

        try {
            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, clientName }),
            });

            if (!res.ok) {
                if (res.status === 409) throw new Error('You already have an active trial session in progress.')
                const { error } = await res.json().catch(() => ({ error: 'Failed to create session' }));
                throw new Error(error);
            }

            const session = await res.json();
            setSessionId(session.id);
            setMessages([{ role: 'assistant', content: '' }]);
            startStream([], { slug, sessionId: session.id, transcript: [] });
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to start session'));
            setStatus('error');
        }
    }, [slug, clientName, startStream]);

    useEffect(() => {
        if (!clientName || hasStarted.current) return;
        hasStarted.current = true;
        let cancelled = false;
        start().then(() => {
            if (cancelled) {
                // session created and will mark abandoned or let TTL clean up
            }
        });
        return () => { cancelled = true; };
    }, [clientName, start]);

    const sendMessage = useCallback(
        (content: string) => {
            if (status !== 'user_turn' || !sessionId) return;

            const userMessage: Message = {
                role: 'user',
                content,
                timestamp: new Date().toISOString()
            };
            const updatedHistory = [...messages, userMessage];
            const cleanHistory = updatedHistory.map(({ role, content }) => ({ role, content }));
            setMessages([...updatedHistory, { role: 'assistant', content: '' }]);
            setStatus('streaming');
            startStream(cleanHistory, { slug, sessionId, transcript: updatedHistory });
        },
        [status, messages, slug, startStream, sessionId]
    );

    return { status, messages, sessionId, sendMessage, cancel, error };
}