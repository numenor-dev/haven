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
    IntakeSessionProps,
    IntakeSessionReturn
} from "@/types/types";
import { useStream } from "./useStream";


export default function useIntakeSession({
    firm,
    isDemo,
    isActive,
}: IntakeSessionProps): IntakeSessionReturn {
    const [status, setStatus] = useState<SessionStatus>("idle");
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);

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
            console.error("[useIntakeSession] Stream error:", error);
            setStatus("user_turn");
        },
    });

    const start = useCallback(() => {
        if (status !== "idle") return;
        setStatus("streaming");
        setMessages([{ role: "assistant", content: "" }]);
        startStream([], { firm, isDemo });
    }, [status, firm, isDemo, startStream]);

    const hasStarted = useRef(false);

    useEffect(() => {
        if (isActive && !hasStarted.current) {
            hasStarted.current = true;
            Promise.resolve().then(start);
        }
    }, [isActive, start]);

    const sendMessage = useCallback(
        (content: string) => {
            if (status !== "user_turn") return;

            const userMessage: Message = { role: "user", content };
            const updatedHistory = [...messages, userMessage];

            setMessages([...updatedHistory, { role: "assistant", content: "" }]);
            setStatus("streaming");
            startStream(updatedHistory, { firm, isDemo });
        },
        [status, messages, firm, isDemo, startStream]
    );

    return { status, messages, sessionId, start, sendMessage, cancelStream };
}