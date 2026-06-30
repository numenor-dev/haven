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
    const [status, setStatus] = useState<SessionStatus>("idle");
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

    const { startStream, cancelStream } = useStream({
        onChunk: appendToLastMessage,
        onComplete: () => setStatus("user_turn"),
        onError: (error) => {
            console.error("[useLiveSession] Stream error:", error);
            setError(error);
            setStatus("error");
        },
    });

    const cancel = useCallback(() => {
        cancelStream();
        if (status === "streaming") setStatus("user_turn");
    }, [cancelStream, status]);

    const start = useCallback(async () => {
        if (status !== "idle") return;
        setStatus("streaming");

        try {
            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firmSlug: slug }),
            });

            if (!res.ok) throw new Error('Failed to create session');

            const session = await res.json();
            setSessionId(session.id);
            setMessages([{ role: "assistant", content: "" }]);
            startStream([], { slug, sessionId: session.id });
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to start session'));
            setStatus("error");
        }
    }, [status, slug, startStream]);

    useEffect(() => {
        if (!clientName || !hasStarted.current) return;
        hasStarted.current = true;
        Promise.resolve().then(start);
    }, [clientName, start]);

    const sendMessage = useCallback(
        (content: string) => {
            if (status !== "user_turn" || !sessionId) return;

            const userMessage: Message = { role: "user", content };
            const updatedHistory = [...messages, userMessage];

            setMessages([...updatedHistory, { role: "assistant", content: "" }]);
            setStatus("streaming");
            startStream(updatedHistory, { slug, sessionId });
        },
        [status, messages, slug, startStream, sessionId]
    );

    return { status, messages, sessionId, sendMessage, cancel, error };
}