'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSmoothChat } from '@/components/hooks/useSmoothChat';
import { useStream } from '@/components/hooks/useStream';
import {
    LiveSessionProps,
    LiveSessionReturn,
    Message,
    SessionStatus,
    TranscriptMessage
} from '@/types/types';

export default function useLiveSession({ slug, clientInfo, firmName }: LiveSessionProps): LiveSessionReturn {
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const hasStarted = useRef(false);

    const { textRef, enqueue, reset } = useSmoothChat(() => {
        setStatus('user_turn');
    });

    const appendToLastMessage = useCallback((text: string) => {
        setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, content: last.content + text };
            return updated;
        });
    }, []);

    const onChunk = useCallback((delta: string) => {
        enqueue(delta);
        appendToLastMessage(delta);
    }, [enqueue, appendToLastMessage]);

    const onComplete = useCallback(() => {
        setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
                updated[updated.length - 1] = { ...last, timestamp: new Date().toISOString() };
            }
            return updated;
        });
    }, []);

    const onError = useCallback((err: Error) => {
        console.error('[useLiveSession] Stream error:', err);
        setError(err);
        setStatus('error');
    }, []);

    const onSessionComplete = useCallback(() => setStatus('complete'), []);

    const { startStream, cancelStream } = useStream({ onChunk, onComplete, onError, onSessionComplete });

    const cancel = useCallback(() => {
        cancelStream();
        if (status === 'streaming') setStatus('user_turn');
    }, [cancelStream, status]);

    const start = useCallback(async () => {
        if (!clientInfo) return;

        setStatus('streaming');

        try {
            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    clientName: clientInfo.name,
                    phone: clientInfo.phone,
                    email: clientInfo.email,
                }),
            });

            if (!res.ok) {
                if (res.status === 409) throw new Error('You already have an active trial session in progress.');
                const { error } = await res.json().catch(() => ({ error: 'Failed to create session' }));
                throw new Error(error);
            }

            const session = await res.json();
            setSessionId(session.id);
            setMessages([{ role: 'assistant', content: '' }]);

            startStream([], {
                slug,
                sessionId: session.id,
                transcript: [],
                clientName: clientInfo.name,
                firmName,
                phone: clientInfo.phone,
                email: clientInfo.email,
                localHour: new Date().getHours(),
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to start session'));
            setStatus('error');
        }
    }, [slug, clientInfo, firmName, startStream]);

    useEffect(() => {
        if (!clientInfo || hasStarted.current) return;
        hasStarted.current = true;
        let cancelled = false;
        start().then(() => {
            if (cancelled) {
                // Session still created and will be marked abandoned or cleaned up by TTL
            }
        });
        return () => { cancelled = true; };
    }, [clientInfo, start]);

    const sendMessage = useCallback((content: string) => {
        // clientInfo null check narrows the type for startStream call below.
        if (status !== 'user_turn' || !sessionId || !clientInfo) return;

        const userMessage: Message = {
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };
        const updatedHistory = [...messages, userMessage];
        const cleanHistory = updatedHistory.map(({ role, content }) => ({ role, content }));

        setMessages([...updatedHistory, { role: 'assistant', content: '' }]);
        setStatus('streaming');
        reset();

        startStream(cleanHistory, {
            slug,
            sessionId,
            transcript: updatedHistory.filter((m): m is TranscriptMessage => !!m.timestamp),
            clientName: clientInfo.name,
            firmName,
            phone: clientInfo.phone,
            email: clientInfo.email,
            localHour: new Date().getHours(),
        });
    }, [status, sessionId, clientInfo, messages, slug, firmName, startStream, reset]);

    const manualEndSession = useCallback(async () => {
        setStatus('complete');
        if (!sessionId) return;

        try {
            const res = await fetch('/api/chat/session', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    transcript: messages.filter((m): m is TranscriptMessage => !!m.timestamp),
                    clientName: clientInfo?.name,
                    phone: clientInfo?.phone,
                    email: clientInfo?.email,
                }),
            });

            if (!res.ok) {
                console.error('[useLiveSession] Failed to complete session on server');
            }
        } catch (err) {
            console.error('[useLiveSession] manualEndSession error:', err);
        }
    }, [sessionId, messages, clientInfo]);

    return { status, messages, sessionId, sendMessage, cancel, manualEndSession, textRef, error };
}