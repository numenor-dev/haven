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


export default function useLiveSession({ firm }: LiveSessionProps): LiveSessionReturn {
    const [status, setStatus] = useState<SessionStatus>("idle");
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

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
            console.error("[useDemoSession] Stream error:", error);
            setError(error);
            setStatus("error");
        },
    });
    
    const cancel = useCallback(() => {
        cancelStream();
        setStatus("user_turn");
    }, [cancelStream]);

    const start = useCallback(() => {
        if (status !== "idle") return;
        setStatus("streaming");
        setSessionId(crypto.randomUUID())
        setMessages([{ role: "assistant", content: "" }]);
        startStream([], { firm, sessionId });
    }, [status, firm, startStream, sessionId]);

    const hasStarted = useRef(false);

    useEffect(() => {
        if (!hasStarted.current) {
            hasStarted.current = true;
            start();
        }
    }, [start]);

    const sendMessage = useCallback(
        (content: string) => {
            if (status !== "user_turn") return;

            const userMessage: Message = { role: "user", content };
            const updatedHistory = [...messages, userMessage];

            setMessages([...updatedHistory, { role: "assistant", content: "" }]);
            setStatus("streaming");
            startStream(updatedHistory, { firm, sessionId });
        },
        [status, messages, firm, startStream, sessionId]
    );

    return { status, messages, sessionId, start, sendMessage, cancel, error };
}